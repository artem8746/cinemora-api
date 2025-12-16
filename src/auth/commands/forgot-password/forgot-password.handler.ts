import {
  CommandHandler,
  ICommandHandler,
  QueryBus,
  CommandBus,
} from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { EmailService } from '@/email/email.service';
import { JwtSummaryDto } from '../../dto/jwt-summary.dto';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { NotFoundException } from '@nestjs/common';
import { ResetPasswordTokenCommand } from '@/tokens/commands/reset-password-token/reset-password-token.command';
import { ResetPasswordTokenCommandResponse } from '@/tokens/commands/reset-password-token/reset-password-token.handler';
import { SaveTokenCommand } from '@/tokens/commands/save-token/save-token.command';
import { SaveTokenCommandResponse } from '@/tokens/commands/save-token/save-token.handler';
import { GetUserByEmailQuery } from '@/users/queries/get-user-by-email/get-user-by-email.query';
import { GetUserByEmailQueryResponse } from '@/users/queries/get-user-by-email/get-user-by-email.handler';
import { parseTimeDurationToSeconds } from '@/utils/parse-time-duration';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const { email } = command;
    this.logger.info('Forgot password command received', { email });

    const user = await this.queryBus.execute<
      GetUserByEmailQuery,
      GetUserByEmailQueryResponse
    >(new GetUserByEmailQuery(email));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const jwtPayload = new JwtSummaryDto(user);
    const resetToken = await this.commandBus.execute<
      ResetPasswordTokenCommand,
      ResetPasswordTokenCommandResponse
    >(new ResetPasswordTokenCommand(jwtPayload));

    await this.commandBus.execute<SaveTokenCommand, SaveTokenCommandResponse>(
      new SaveTokenCommand(
        `reset_token:${user.email}`,
        resetToken,
        parseTimeDurationToSeconds(
          this.configService.getOrThrow('auth.expiresResetPassword'),
        ),
      ),
    );

    const frontendUrl = this.configService.getOrThrow('app.frontendUrl');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendEmail(email, resetLink, 'reset');
  }
}

export type ForgotPasswordCommandResponse = ReturnType<
  ForgotPasswordHandler['execute']
>;
