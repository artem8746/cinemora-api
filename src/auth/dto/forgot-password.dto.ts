import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import escapeHtml from 'escape-html';

export class ForgotPasswordDto {
  @ApiProperty({
    required: true,
    example: 'user@example.com',
    description: 'Email address to send password reset link',
  })
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => escapeHtml(value as string))
  readonly email: string;
}
