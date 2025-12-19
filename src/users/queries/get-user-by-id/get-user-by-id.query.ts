import { User } from '@/users/user.entity';
import { Query } from '@nestjs/cqrs';

export class GetUserByIdQuery extends Query<User | null> {
  constructor(public readonly id: string) {
    super();
  }
}
