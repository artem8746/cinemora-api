import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { SendActivationEmailCommand } from './send-activation-email.command';
import { GenerateActivationTokenCommand } from '@/tokens/commands/generate-activation-token/generate-activation-token.command';
import { GenerateActivationTokenCommandResponse } from '@/tokens/commands/generate-activation-token/generate-activation-token.handler';
import { EmailService } from '@/email/email.service';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@CommandHandler(SendActivationEmailCommand)
export class SendActivationEmailHandler
  implements ICommandHandler<SendActivationEmailCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: SendActivationEmailCommand): Promise<void> {
    const { email } = command;

    try {
      // Generate activation token
      const activationToken = await this.commandBus.execute<
        GenerateActivationTokenCommand,
        GenerateActivationTokenCommandResponse
      >(new GenerateActivationTokenCommand(email));

      // Create activation link
      const frontendUrl = this.configService.getOrThrow('app.frontendUrl');
      const activationLink = `${frontendUrl}/activate?token=${activationToken}`;

      // Send activation email
      await this.emailService.sendEmail(email, activationLink, 'activation');

      this.logger.info(
        `Activation email sent to user: ${email}`,
        SendActivationEmailHandler.name,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send activation email to user: ${email}`,
        error,
        SendActivationEmailHandler.name,
      );
    }
  }
}

export type SendActivationEmailCommandResponse = void;
