import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { GetUserByEmailHandler } from './queries/get-user-by-email/get-user-by-email.handler';
import { CreateUserHandler } from './commands/create-user/create-user.handler';
import { CreateUserSocialHandler } from './commands/create-user-social/create-user-social.handler';
import { UpdateUserPasswordHandler } from './commands/update-user-password/update-user-password.handler';
import { ActivateAccountHandler } from './commands/activate-account/activate-account.handler';
import { GenerateUsernameHandler } from './commands/generate-username/generate-username.handler';
import { CqrsModule } from '@nestjs/cqrs';

export const CommandHandlers = [
  GetUserByEmailHandler,
  CreateUserHandler,
  CreateUserSocialHandler,
  UpdateUserPasswordHandler,
  ActivateAccountHandler,
  GenerateUsernameHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([User]), CqrsModule],
  controllers: [UsersController],
  providers: [UsersService, ...CommandHandlers],
  exports: [UsersService, ...CommandHandlers],
})
export class UsersModule {}
