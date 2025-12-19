import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CommandBus } from '@nestjs/cqrs';
import { ActivateAccountCommand } from './commands/activate-account/activate-account.command';
import { ActivateAccountCommandResponse } from './commands/activate-account/activate-account.handler';
import { UpdateProfileCommand } from './commands/update-profile/update-profile.command';
import { UpdateProfileCommandResponse } from './commands/update-profile/update-profile.handler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonResponses } from '@/utils/swagger.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @CommonResponses.ApiResponseSuccess
  public getCurrentUser(@CurrentUserId() userId: string) {
    return this.usersService.findById(userId);
  }

  @Get()
  getAll(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public getMe(@CurrentUserId() userId: string) {
    return this.usersService.findById(userId);
  }

  @Post('activate')
  @ApiOperation({ summary: 'Activate user account' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public activateAccount(@Body() body: { token: string }) {
    return this.commandBus.execute<
      ActivateAccountCommand,
      ActivateAccountCommandResponse
    >(new ActivateAccountCommand(body.token));
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public updateProfile(
    @CurrentUserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.commandBus.execute<
      UpdateProfileCommand,
      UpdateProfileCommandResponse
    >(new UpdateProfileCommand(userId, updateProfileDto));
  }
}
