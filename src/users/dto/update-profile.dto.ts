import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import escapeHtml from 'escape-html';

export class UpdateProfileDto {
  @ApiProperty({
    required: false,
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @Transform(({ value }) => (value ? escapeHtml(value as string) : undefined))
  readonly avatar?: string;

  @ApiProperty({
    required: false,
    description: 'User username',
    example: 'johndoe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'Username must not exceed 64 characters' })
  @Transform(({ value }) => (value ? escapeHtml(value as string) : undefined))
  readonly username?: string;

  @ApiProperty({
    required: false,
    description: 'User position',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128, { message: 'Position must not exceed 128 characters' })
  @Transform(({ value }) => (value ? escapeHtml(value as string) : undefined))
  readonly position?: string;

  @ApiProperty({
    required: false,
    description: 'User location',
    example: 'New York, USA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128, { message: 'Location must not exceed 128 characters' })
  @Transform(({ value }) => (value ? escapeHtml(value as string) : undefined))
  readonly location?: string;
}
