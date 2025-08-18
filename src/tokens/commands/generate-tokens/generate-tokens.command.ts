import { User } from '@/users/user.entity';

export class GenerateTokensCommand {
  constructor(public readonly payload: User) {}
}
