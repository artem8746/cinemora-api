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

export const CommandHandlers = [RegisterHandler];

@Module({
  imports: [TypeOrmModule.forFeature([User, Token]), CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, ...CommandHandlers, TokensService, JwtService],
})
export class AuthModule {}
