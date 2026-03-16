import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyAccessTokenCommand } from './verify-access-token.command';
import { TokensService } from '@/tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { TokenExpiredError } from '@nestjs/jwt';

@CommandHandler(VerifyAccessTokenCommand)
export class VerifyAccessTokenHandler implements ICommandHandler<VerifyAccessTokenCommand> {
  constructor(
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: VerifyAccessTokenCommand): Promise<{
    isValid: boolean;
    isExpired: boolean;
    payload?: JwtSummaryDto;
  }> {
    const { accessToken } = command;

    try {
      const jwtSecretAccess = this.configService.getOrThrow(
        'auth.jwtSecretAccess',
      );
      const payload = await this.tokensService.verifyToken({
        token: accessToken,
        secret: jwtSecretAccess,
      });

      return {
        isValid: true,
        isExpired: false,
        payload,
      };
    } catch (error) {
      const isExpired =
        error instanceof TokenExpiredError ||
        (error instanceof Error && error.name === 'TokenExpiredError');

      return {
        isValid: false,
        isExpired,
      };
    }
  }
}

export type VerifyAccessTokenCommandResponse = ReturnType<
  VerifyAccessTokenHandler['execute']
>;
