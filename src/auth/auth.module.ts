import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterHandler } from './commands/register/register.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from '@/users/user.entity';
import { Token } from '../tokens/token.entity';
import { TokensService } from '../tokens/tokens.service';
import { JwtService } from '@nestjs/jwt';
import { CookieService } from './services/cookie.service';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

export const CommandHandlers = [RegisterHandler];

@Module({
  imports: [TypeOrmModule.forFeature([User, Token]), CqrsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokensService,
    JwtService,
    ...CommandHandlers,
    CookieService,
    LocalStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
