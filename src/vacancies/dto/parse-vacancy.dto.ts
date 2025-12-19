import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseVacancyDto {
  @ApiProperty({
    description: 'Vacancy URL to parse',
    example: 'https://dou.tech/vacancy/12345678',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url!: string;
}
