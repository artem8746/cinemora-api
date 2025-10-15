import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import escapeHtml from 'escape-html';
import { IsValidPassword } from '@/validators/password.validator';

export class ResetPasswordDto {
  @ApiProperty({
    required: true,
    description: 'JWT token for password reset',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Token must not be empty' })
  @IsString()
  @Transform(({ value }) => escapeHtml(value as string))
  readonly token: string;

  @ApiProperty({
    required: true,
    description: 'New password',
  })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @Validate(IsValidPassword)
  readonly newPassword: string;
}
