import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersService } from '@/users/users.service';
import { GetUserByEmailQuery } from './get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly usersService: UsersService) {}

  execute(command: GetUserByEmailQuery) {
    return this.usersService.findByEmail(command.email);
  }
}

export type GetUserByEmailQueryResponse = ReturnType<
  GetUserByEmailHandler['execute']
>;
