import { IsEmail, IsNotEmpty, Validate, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import escapeHtml from 'escape-html';
import { IsValidPassword } from '@/validators/password.validator';

export class SignUpDto {
  @ApiProperty({
    required: true,
    example: 'Admin@gmail.com',
  })
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Length(8, 64)
  @Transform(({ value }) => escapeHtml(value as string))
  readonly email: string;

  @ApiProperty({
    required: true,
  })
  @Validate(IsValidPassword)
  readonly password: string;
}
