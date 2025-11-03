import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
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
import { AuthenthicatedRequest } from '@/generic/interface/request';
import { AccessTokenGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('users')
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

  @Patch('profile')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async updateProfile(
    @Req() request: AuthenthicatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const userId = request.user?.sub;
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.commandBus.execute<
      UpdateProfileCommand,
      UpdateProfileCommandResponse
    >(new UpdateProfileCommand(userId, updateProfileDto));

    return updatedUser;
  }
}
