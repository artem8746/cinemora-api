import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CommonBody, CommonResponses } from '@/utils/swagger.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { FastifyReply } from 'fastify';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from './commands/register/register.command';
import { RegisterCommandResponse } from './commands/register/register.handler';
import { CookieService } from './services/cookie.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GenerateTokensCommand } from '@/tokens/commands/generate-tokens/generate-tokens.command';
import { GenerateTokensCommandResponse } from '@/tokens/commands/generate-tokens/generate-tokens.handler';
import { AuthenthicatedRequest } from '@/generic/interface/request';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleAuthCommand } from './commands/google-auth/google-auth.command';
import { GoogleAuthCommandResponse } from './commands/google-auth/google-auth.handler';
import { GoogleUser } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly cookieService: CookieService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      GoogleAuthCommand,
      GoogleAuthCommandResponse
    >(new GoogleAuthCommand(req.user));

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);
  }

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

  @Post('sign-in')
  @ApiOperation({ summary: 'Login a user' })
  @UseGuards(LocalAuthGuard)
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  @CommonBody.LoginUserBody
  public async signIn(
    @Req() request: AuthenthicatedRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      GenerateTokensCommand,
      GenerateTokensCommandResponse
    >(new GenerateTokensCommand(request.user));

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);
  }
}
