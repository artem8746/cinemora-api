import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserPasswordCommand } from '@/users/commands/update-user-password/update-user-password.command';
import { TokensService } from '@/tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';
import { compare } from 'bcrypt';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const { token, newPassword } = command;

    try {
      const payload = await this.tokensService.verifyToken({
        token,
        secret: this.configService.getOrThrow('auth.jwtSecretResetPassword'),
      });

      if (!payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      this.logger.info('JWT token verified', {
        email: payload.email,
        userId: payload.sub,
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const redisToken = await this.redisClient.get(
        `reset_token:${user.email}`,
      );

      if (!redisToken) {
        throw new UnauthorizedException('Reset token has expired or been used');
      }

      if (redisToken !== token) {
        this.logger.warn('Token mismatch between JWT and Redis', {
          email: user.email,
          jwtTokenLength: token.length,
          redisTokenLength: redisToken.length,
        });
        throw new UnauthorizedException('Invalid reset token');
      }

      if (!user.password) {
        throw new BadRequestException(
          'You used socials for auth, you cannot reset password',
        );
      }

      const isSamePassword = await compare(newPassword, user.password);

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from the current password',
        );
      }

      await this.redisClient.del(`reset_token:${user.email}`);

      this.logger.info('Reset token removed from Redis', {
        email: user.email,
      });

      await this.commandBus.execute(
        new UpdateUserPasswordCommand(payload.sub, newPassword),
      );

      this.logger.info('Password reset successful', {
        userId: payload.sub,
        email: user.email,
      });
    } catch (error) {
      this.logger.error('Password reset failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Reset token has expired');
      }
      if (error instanceof Error && error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid reset token');
      }

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException('Password reset failed');
    }
  }
}

export type ResetPasswordCommandResponse = ReturnType<
  ResetPasswordHandler['execute']
>;
