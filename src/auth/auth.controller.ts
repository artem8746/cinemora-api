import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CommonBody, CommonResponses } from '@/utils/swagger.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { FastifyReply } from 'fastify';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from './commands/register/register.command';
import { RegisterCommandResponse } from './commands/register/register.handler';
import { CookieService } from './services/cookie.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly cookieService: CookieService,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Create a new user' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  @CommonBody.RegisterUserBody
  public async signUp(
    @Body()
    signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      RegisterCommand,
      RegisterCommandResponse
    >(new RegisterCommand(signUpDto.email, signUpDto.password));

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);
  }
}
