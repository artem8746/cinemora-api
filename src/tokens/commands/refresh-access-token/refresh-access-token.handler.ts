import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshAccessTokenCommand } from './refresh-access-token.command';
import { TokensService } from '@/tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { User } from '@/users/user.entity';
import { PinoLogger } from 'nestjs-pino';

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler
  implements ICommandHandler<RefreshAccessTokenCommand>
{
  constructor(
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RefreshAccessTokenHandler.name);
  }

  async execute(
    command: RefreshAccessTokenCommand,
  ): Promise<{ accessToken: string } | null> {
    const { refreshToken } = command;

    try {
      const jwtSecretRefresh = this.configService.getOrThrow(
        'auth.jwtSecretRefresh',
      );
      const payload = await this.tokensService.verifyToken({
        token: refreshToken,
        secret: jwtSecretRefresh,
      });

      const tokenRecord =
        await this.tokensService.findTokenByRefreshToken(refreshToken);

      if (!tokenRecord || tokenRecord.user.id !== payload.sub) {
        this.logger.warn(
          'RefreshAccessTokenHandler: Token not found or user mismatch',
        );
        return null;
      }

      const cleanPayload = new JwtSummaryDto({
        id: payload.sub,
        email: payload.email,
      } as User);

      const accessToken =
        await this.tokensService.createAccessToken(cleanPayload);

      return { accessToken };
    } catch (error) {
      this.logger.error('RefreshAccessTokenHandler error:', error);
      return null;
    }
  }
}

export type RefreshAccessTokenCommandResponse = ReturnType<
  RefreshAccessTokenHandler['execute']
>;
