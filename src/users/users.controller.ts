import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CommandBus } from '@nestjs/cqrs';
import { ActivateAccountCommand } from './commands/activate-account/activate-account.command';
import { ActivateAccountCommandResponse } from './commands/activate-account/activate-account.handler';
import { ApiOperation } from '@nestjs/swagger';
import { CommonResponses } from '@/utils/swagger.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate user account' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async activateAccount(@Body() body: { token: string }) {
    const result = await this.commandBus.execute<
      ActivateAccountCommand,
      ActivateAccountCommandResponse
    >(new ActivateAccountCommand(body.token));

    return result;
  }
}
