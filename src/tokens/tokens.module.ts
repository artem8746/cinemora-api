import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@/tokens/token.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { TokensService } from './tokens.service';
import { GenerateTokensHandler } from './commands/generate-tokens/generate-tokens.handler';
import { RegisterTokenHandler } from './commands/register-token/register-token.handler';
import { ResetPasswordTokenHandler } from './commands/reset-password-token/reset-password-token.handler';
import { SaveTokenHandler } from './commands/save-token/save-token.handler';
import { GenerateActivationTokenHandler } from './commands/generate-activation-token/generate-activation-token.handler';
import { VerifyActivationTokenHandler } from './commands/verify-activation-token/verify-activation-token.handler';
import { JwtService } from '@nestjs/jwt';

export const CommandHandlers = [
  GenerateTokensHandler,
  RegisterTokenHandler,
  ResetPasswordTokenHandler,
  SaveTokenHandler,
  GenerateActivationTokenHandler,
  VerifyActivationTokenHandler,
];
@Module({
  imports: [TypeOrmModule.forFeature([Token]), CqrsModule],
  providers: [TokensService, JwtService, ...CommandHandlers],
})
export class TokensModule {}
