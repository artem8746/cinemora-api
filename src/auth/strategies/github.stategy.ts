/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';

import { ConfigService } from '@nestjs/config';
import { SocialUser } from '../commands/social-auth/social-auth.command';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private config: ConfigService) {
    super({
      clientID: config.get('auth.githubClientId'),
      clientSecret: config.get('auth.githubClientSecret'),
      callbackURL: config.get('auth.githubCallbackUrl'),
      scope: ['user:email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: SocialUser) => void,
  ) {
    const user: SocialUser = {
      email: profile.username + '@github.com',
      username: profile.username,
      picture: profile.photos?.[0]?.value ?? '',
      provider: 'github',
    };
    done(null, user);
  }
}
