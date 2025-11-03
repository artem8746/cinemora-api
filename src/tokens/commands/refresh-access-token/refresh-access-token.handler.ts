import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '@/tokens/token.entity';
import { Repository } from 'typeorm';
import { RefreshAccessTokenCommand } from './refresh-access-token.command';
import { TokensService } from '@/tokens/tokens.service';
import { ConfigService } from '@nestjs/config';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { User } from '@/users/user.entity';

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler
  implements ICommandHandler<RefreshAccessTokenCommand>
{
  constructor(
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

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

      const tokenRecord = await this.tokenRepository.findOne({
        where: { refreshToken },
        relations: ['user'],
      });

      if (!tokenRecord || tokenRecord.user.id !== payload.sub) {
        console.warn(
          'RefreshAccessTokenHandler: Token not found or user mismatch',
        );
        return null;
      }

      const cleanPayload = new JwtSummaryDto({
        id: payload.sub,
        email: payload.email,
      } as User);

      console.warn('RefreshAccessTokenHandler: Clean payload', {
        sub: cleanPayload.sub,
        email: cleanPayload.email,
        hasExp: 'exp' in payload,
      });

      const accessToken =
        await this.tokensService.createAccessToken(cleanPayload);

      return { accessToken };
    } catch (error) {
      console.error('RefreshAccessTokenHandler error:', error);
      return null;
    }
  }
}

export type RefreshAccessTokenCommandResponse = ReturnType<
  RefreshAccessTokenHandler['execute']
>;
