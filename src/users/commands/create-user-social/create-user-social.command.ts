export interface CreateUserSocialParams {
  email: string;
  username: string;
  picture: string;
  provider: 'google' | 'github';
}

export class CreateUserSocialCommand {
  constructor(public readonly params: CreateUserSocialParams) {}
}
