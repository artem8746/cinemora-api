import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CqrsModule } from '@nestjs/cqrs';
import { SendActivationEmailHandler } from './commands/send-activation-email/send-activation-email.handler';

export const CommandHandlers = [SendActivationEmailHandler];

@Module({
  imports: [CqrsModule],
  providers: [EmailService, ...CommandHandlers],
  exports: [EmailService, ...CommandHandlers],
})
export class EmailModule {}
