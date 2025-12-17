import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { ActivateAccountCommand } from './activate-account.command';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { PinoLogger } from 'nestjs-pino';
import { VerifyActivationTokenCommand } from '@/tokens/commands/verify-activation-token/verify-activation-token.command';
import { VerifyActivationTokenCommandResponse } from '@/tokens/commands/verify-activation-token/verify-activation-token.handler';

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountHandler implements ICommandHandler<ActivateAccountCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: ActivateAccountCommand): Promise<{ message: string }> {
    const { token } = command;

    try {
      // Verify activation token using command
      const payload = await this.commandBus.execute<
        VerifyActivationTokenCommand,
        VerifyActivationTokenCommandResponse
      >(new VerifyActivationTokenCommand(token));

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('Invalid activation token');
      }

      if (user.isConfirmed) {
        throw new BadRequestException('Account is already activated');
      }

      await this.usersService.updateUser(user.id, { isConfirmed: true });

      this.logger.info(
        `Account activated for user: ${user.id}`,
        ActivateAccountHandler.name,
      );

      return {
        message: 'Account activated successfully. You can now sign in.',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error activating account', error);
      throw new UnauthorizedException('Invalid or expired activation token');
    }
  }
}

export type ActivateAccountCommandResponse = ReturnType<
  ActivateAccountHandler['execute']
>;
