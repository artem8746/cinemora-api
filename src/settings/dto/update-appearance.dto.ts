import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class UpdateAppearanceDto {
  @IsEnum(['light', 'dark'])
  theme: 'light' | 'dark';

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  dateFormat: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;
}
