import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserByEmailCommand } from '@/users/commands/get-user-by-email/get-user-by-email.command';
import { User } from '@/users/user.entity';
import { EmailService } from '@/email/email.service';
import { TokensService } from '@/tokens/tokens.service';
import { JwtSummaryDto } from '../../dto/jwt-summary.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PinoLogger } from 'nestjs-pino';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly emailService: EmailService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const { email } = command;
    this.logger.info('Forgot password command received', { email });

    const user = await this.commandBus.execute<GetUserByEmailCommand, User>(
      new GetUserByEmailCommand(email),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const jwtPayload = new JwtSummaryDto(user);
    const resetToken =
      await this.tokensService.createResetPasswordToken(jwtPayload);

    await this.redisClient.setex(
      `reset_token:${user.email}`,
      this.configService.getOrThrow('auth.expiresResetPassword'),
      resetToken,
    );

    const frontendUrl = this.configService.getOrThrow('app.frontendUrl');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendEmail(email, resetLink, 'reset');
  }
}

export type ForgotPasswordCommandResponse = ReturnType<
  ForgotPasswordHandler['execute']
>;
