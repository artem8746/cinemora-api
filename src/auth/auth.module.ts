import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterHandler } from './commands/register/register.handler';
import { ForgotPasswordHandler } from './commands/forgot-password/forgot-password.handler';
import { ResetPasswordHandler } from './commands/reset-password/reset-password.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from '@/users/user.entity';
import { Token } from '../tokens/token.entity';
import { TokensService } from '../tokens/tokens.service';
import { JwtService } from '@nestjs/jwt';
import { CookieService } from './services/cookie.service';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailModule } from '@/email/email.module';
import { UsersModule } from '@/users/users.module';
import { RedisModule } from '@/redis/redis.module';

export const CommandHandlers = [
  RegisterHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token]),
    CqrsModule,
    EmailModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    JwtService,
    ...CommandHandlers,
    CookieService,
    LocalStrategy,
  ],
})
export class AuthModule {}
