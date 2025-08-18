import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import escapeHtml from 'escape-html';

export class SignInDto {
  @ApiProperty({
    required: true,
    example: 'Admin@gmail.com',
  })
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => escapeHtml(value as string))
  readonly password: string;
}
