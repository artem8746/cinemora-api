import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersService } from '@/users/users.service';
import { GetUserByIdQuery } from './get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly usersService: UsersService) {}

  execute(query: GetUserByIdQuery) {
    return this.usersService.findById(query.id);
  }
}

export type GetUserByIdQueryResponse = ReturnType<
  GetUserByIdHandler['execute']
>;
