/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { SocialUser } from '../commands/social-auth/social-auth.command';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get('auth.googleClientId'),
      clientSecret: config.get('auth.googleClientSecret'),
      callbackURL: config.get('auth.googleCallbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;
    const user: SocialUser = {
      email: emails[0].value,
      username: name.givenName + ' ' + name.familyName,
      picture: photos[0].value,
      provider: 'google',
    };
    done(null, user);
  }
}
