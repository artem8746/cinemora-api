import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { GetUserByEmailHandler } from './commands/get-user-by-email/get-user-by-email.handler';
import { CreateUserHandler } from './commands/create-user/create-user.handler';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';

export const CommandHandlers = [GetUserByEmailHandler, CreateUserHandler];

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UsersController],
  providers: [UsersService, ...CommandHandlers, JwtService],
})
export class UsersModule {}
