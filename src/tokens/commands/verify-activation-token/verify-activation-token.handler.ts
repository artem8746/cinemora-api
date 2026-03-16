import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyActivationTokenCommand } from './verify-activation-token.command';
import { TokensService } from '@/tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { UnauthorizedException } from '@nestjs/common';

@CommandHandler(VerifyActivationTokenCommand)
export class VerifyActivationTokenHandler implements ICommandHandler<VerifyActivationTokenCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: VerifyActivationTokenCommand): Promise<JwtSummaryDto> {
    const { token } = command;

    try {
      // Verify activation token
      const payload = await this.tokensService.verifyToken({
        token,
        secret: this.configService.getOrThrow('auth.jwtSecretActivation'),
      });

      this.logger.info(
        `Activation token verified for user: ${payload.sub}`,
        VerifyActivationTokenHandler.name,
      );

      return payload;
    } catch (error) {
      this.logger.error('Error verifying activation token', error);
      throw new UnauthorizedException('Invalid or expired activation token');
    }
  }
}

export type VerifyActivationTokenCommandResponse = JwtSummaryDto;
