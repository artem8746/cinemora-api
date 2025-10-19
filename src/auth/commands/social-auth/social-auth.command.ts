export interface SocialUser {
  email: string;
  username: string;
  picture: string;
  provider: 'google' | 'github';
}

export class SocialAuthCommand {
  constructor(public readonly user: SocialUser) {}
}
