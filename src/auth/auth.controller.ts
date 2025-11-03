import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CommonBody, CommonResponses } from '@/utils/swagger.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { FastifyReply } from 'fastify';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from './commands/register/register.command';
import { RegisterCommandResponse } from './commands/register/register.handler';
import { ForgotPasswordCommand } from './commands/forgot-password/forgot-password.command';
import { ForgotPasswordCommandResponse } from './commands/forgot-password/forgot-password.handler';
import { ResetPasswordCommand } from './commands/reset-password/reset-password.command';
import { ResetPasswordCommandResponse } from './commands/reset-password/reset-password.handler';
import { CookieService } from './services/cookie.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GenerateTokensCommand } from '@/tokens/commands/generate-tokens/generate-tokens.command';
import { GenerateTokensCommandResponse } from '@/tokens/commands/generate-tokens/generate-tokens.handler';
import { AuthenthicatedRequest } from '@/generic/interface/request';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import {
  SocialAuthCommand,
  type SocialUser,
} from './commands/social-auth/social-auth.command';
import { SocialAuthCommandResponse } from './commands/social-auth/social-auth.handler';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { ConfigService } from '@nestjs/config';
import { RegisterTokenCommand } from '@/tokens/commands/register-token/register-token.command';
import { RegisterTokenCommandResponse } from '@/tokens/commands/register-token/register-token.handler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly cookieService: CookieService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(
    @Req() req: Request & { user: SocialUser },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      SocialAuthCommand,
      SocialAuthCommandResponse
    >(
      new SocialAuthCommand({
        ...req.user,
        provider: 'google' as const,
      }),
    );

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);

    const frontendUrl = this.configService.get('app.frontendUrl');
    res.redirect(`${frontendUrl}/dashboard`, HttpStatus.FOUND);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  public async githubAuthRedirect(
    @Req() req: Request & { user: SocialUser },
    @Res() res: FastifyReply,
  ) {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      SocialAuthCommand,
      SocialAuthCommandResponse
    >(
      new SocialAuthCommand({
        ...req.user,
        provider: 'github' as const,
      }),
    );

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);

    const frontendUrl = this.configService.get('app.frontendUrl');
    res.redirect(`${frontendUrl}/dashboard`, HttpStatus.FOUND);
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

    return {
      message:
        'Registration successful. Please check your email to activate your account.',
    };
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

    await this.commandBus.execute<
      RegisterTokenCommand,
      RegisterTokenCommandResponse
    >(
      new RegisterTokenCommand({
        userId: request.user.sub,
        token: refreshToken,
      }),
    );

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.commandBus.execute<
      ForgotPasswordCommand,
      ForgotPasswordCommandResponse
    >(new ForgotPasswordCommand(forgotPasswordDto.email));

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.commandBus.execute<
      ResetPasswordCommand,
      ResetPasswordCommandResponse
    >(
      new ResetPasswordCommand(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      ),
    );

    return {
      message: 'Password has been successfully reset',
    };
  }
}
