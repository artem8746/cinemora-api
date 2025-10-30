import { User } from '@/users/user.entity';
import { Query } from '@nestjs/cqrs';

export class GetUserByEmailQuery extends Query<User | null> {
  constructor(public readonly email: string) {
    super();
  }
}
