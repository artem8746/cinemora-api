import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CommonBody, CommonResponses } from '@/utils/swagger.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { FastifyReply } from 'fastify';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from './commands/register/register.command';
import { ConfigService } from '@nestjs/config';
import { setCookie } from '@/utils/cookies';
import { RegisterCommandResponse } from './commands/register/register.handler';
import { PinoLogger } from 'nestjs-pino';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
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

    const isProduction = this.configService.getOrThrow('app.isProduction');
    const path = this.configService.getOrThrow('app.cookiesPath');

    const domain = this.configService.getOrThrow('app.domain');
    const maxAgeAccessToken = parseInt(
      this.configService.getOrThrow('auth.maxAgeAccessToken').toString(),
      10,
    );
    const maxAgeRefreshToken = parseInt(
      this.configService.getOrThrow('auth.maxAgeRefreshToken').toString(),
      10,
    );

    this.logger.debug('Set token', 'setAccessAndRefreshToken');
    setCookie(res, 'accessToken', accessToken, path, {
      maxAge: maxAgeAccessToken,
      domain: isProduction ? domain : undefined,
    });

    this.logger.debug('Set refresh token', 'setAccessAndRefreshToken');
    setCookie(res, 'refreshToken', refreshToken, path, {
      maxAge: maxAgeRefreshToken,
      domain: isProduction ? domain : undefined,
    });
  }
}
