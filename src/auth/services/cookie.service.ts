import { CookieSerializeOptions } from '@fastify/cookie';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CookieService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  setCookie(
    res: FastifyReply,
    name: string,
    value: string,
    options: CookieSerializeOptions,
  ) {
    const isProduction = this.configService.getOrThrow('app.isProduction');
    const path = this.configService.getOrThrow('app.cookiesPath');

    const domain = this.configService.getOrThrow('app.domain');

    res.setCookie(name, value, {
      path: path,
      secure: isProduction,
      sameSite: isProduction ? 'none' : false,
      httpOnly: true,
      domain: isProduction ? domain : undefined,
      ...options,
    });
  }

  setAuthCookies(res: FastifyReply, accessToken: string, refreshToken: string) {
    const maxAgeAccessToken = this.configService.getOrThrow(
      'auth.maxAgeAccessToken',
    );
    const maxAgeRefreshToken = this.configService.getOrThrow(
      'auth.maxAgeRefreshToken',
    );

    this.logger.debug('Set token', 'setAccessAndRefreshToken');
    this.setCookie(res, 'accessToken', accessToken, {
      maxAge: maxAgeAccessToken,
    });

    this.logger.debug('Set refresh token', 'setAccessAndRefreshToken');
    this.setCookie(res, 'refreshToken', refreshToken, {
      maxAge: maxAgeRefreshToken,
    });
  }
}
