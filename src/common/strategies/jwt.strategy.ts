import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FastifyRequest } from 'fastify';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: FastifyRequest) => {
          if (req.headers?.cookie) {
            const cookieHeader = req.headers.cookie;
            const cookies = cookieHeader.split(';').reduce(
              (acc, cookie) => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                  acc[name] = decodeURIComponent(value);
                }
                return acc;
              },
              {} as Record<string, string>,
            );
            return cookies.accessToken ?? null;
          }

          const fastifyCookies = req.cookies as { accessToken?: string };
          return fastifyCookies?.accessToken ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('auth.jwtSecretAccess'),
    });
  }

  validate(payload: JwtSummaryDto) {
    return payload;
  }
}
