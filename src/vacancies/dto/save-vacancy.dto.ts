import {
  IsString,
  IsNotEmpty,
  IsUrl,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { VacancyDataDto } from './vacancy-data.dto';

export class SaveVacancyDto {
  @ApiProperty({
    description: 'Vacancy URL (optional, required only when parsing from URL)',
    example: 'https://dou.tech/vacancy/12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'Parsed vacancy data',
    type: VacancyDataDto,
  })
  @ValidateNested()
  @Type(() => VacancyDataDto)
  @IsNotEmpty()
  parsedData!: VacancyDataDto;
}
