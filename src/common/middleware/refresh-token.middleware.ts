import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyAccessTokenCommand } from '@/tokens/commands/verify-access-token/verify-access-token.command';
import { VerifyAccessTokenCommandResponse } from '@/tokens/commands/verify-access-token/verify-access-token.handler';
import { RefreshAccessTokenCommand } from '@/tokens/commands/refresh-access-token/refresh-access-token.command';
import { RefreshAccessTokenCommandResponse } from '@/tokens/commands/refresh-access-token/refresh-access-token.handler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          acc[name] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  private setAuthCookies(
    res: ServerResponse,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = this.configService.getOrThrow('app.isProduction');
    const path = this.configService.getOrThrow('app.cookiesPath');
    const domain = this.configService.getOrThrow('app.domain');
    const maxAgeAccessToken = this.configService.getOrThrow(
      'auth.maxAgeAccessToken',
    );
    const maxAgeRefreshToken = this.configService.getOrThrow(
      'auth.maxAgeRefreshToken',
    );

    const cookieOptions = [
      `Path=${path}`,
      'HttpOnly',
      `SameSite=${isProduction ? 'None' : 'Lax'}`,
      ...(isProduction ? ['Secure'] : []),
      ...(isProduction && domain ? [`Domain=${domain}`] : []),
    ].join('; ');

    const cookies = [
      `accessToken=${encodeURIComponent(accessToken)}; ${cookieOptions}; Max-Age=${maxAgeAccessToken}`,
      `refreshToken=${encodeURIComponent(refreshToken)}; ${cookieOptions}; Max-Age=${maxAgeRefreshToken}`,
    ];

    res.setHeader('Set-Cookie', cookies);
  }

  async use(
    req: FastifyRequest,
    res: ServerResponse,
    next: () => void,
  ): Promise<void> {
    const accessToken =
      (req.cookies as { accessToken?: string } | undefined)?.accessToken ||
      (req.headers.cookie
        ? this.parseCookies(req.headers.cookie).accessToken
        : undefined);
    const refreshToken =
      (req.cookies as { refreshToken?: string } | undefined)?.refreshToken ||
      (req.headers.cookie
        ? this.parseCookies(req.headers.cookie).refreshToken
        : undefined);

    if (!accessToken) {
      return next();
    }

    const verificationResult = await this.commandBus.execute<
      VerifyAccessTokenCommand,
      VerifyAccessTokenCommandResponse
    >(new VerifyAccessTokenCommand(accessToken));

    if (verificationResult.isValid) {
      return next();
    }

    if (!verificationResult.isExpired || !refreshToken) {
      return next();
    }

    try {
      const result = await this.commandBus.execute<
        RefreshAccessTokenCommand,
        RefreshAccessTokenCommandResponse
      >(new RefreshAccessTokenCommand(refreshToken));

      if (!result?.accessToken) {
        return next();
      }

      const { accessToken: newAccessToken } = result;

      this.setAuthCookies(res, newAccessToken, refreshToken);

      if (req.cookies) {
        (req.cookies as { accessToken?: string }).accessToken = newAccessToken;
      }

      const existingCookies = req.headers.cookie
        ? req.headers.cookie
            .split(';')
            .filter((cookie) => cookie.trim().split('=')[0] !== 'accessToken')
        : [];
      req.headers.cookie = [
        ...existingCookies.map((c) => c.trim()),
        `accessToken=${encodeURIComponent(newAccessToken)}`,
      ].join('; ');

      return next();
    } catch {
      return next();
    }
  }
}
