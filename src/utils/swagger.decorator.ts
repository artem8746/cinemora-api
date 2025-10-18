import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { SignInDto } from '@/auth/dto/sign-in.dto';
import { SignUpDto } from '@/auth/dto/sign-up.dto';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiResponse } from '@nestjs/swagger';

export const CommonBody = {
  RegisterUserBody: ApiBody({
    description: 'Register user body',
    type: SignUpDto,
  }),
  LoginUserBody: ApiBody({
    description: 'Login user body',
    type: SignInDto,
  }),
  ForgotPasswordBody: ApiBody({
    description: 'Forgot password request body',
    type: ForgotPasswordDto,
  }),
  ResetPasswordBody: ApiBody({
    description: 'Reset password request body',
    type: ResetPasswordDto,
  }),
};

export const CommonResponses = {
  ApiResponseSuccess: ApiResponse({
    status: HttpStatus.OK,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        status: { type: 'number', example: 200 },
      },
    },
  }),

  ApiResponseJwtUser: ApiResponse({
    status: HttpStatus.OK,
    description: 'Jwt user info',
    type: JwtSummaryDto,
  }),

  ApiResponseBadRequest: ApiBadRequestResponse({
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        status: { type: 'number', example: 400 },
        timestamp: {
          type: 'string',
          format: 'date',
          example: new Date().toISOString(),
        },
        path: { type: 'string' },
        data: { type: 'object' },
      },
    },
  }),
};
