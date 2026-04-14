import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VacancyStatus } from '../enums/vacancy-status.enum';
import { VacancyDataDto } from './vacancy-data.dto';

export class UpdateVacancyDto {
  @ApiProperty({
    required: false,
    description: 'Vacancy status',
    enum: VacancyStatus,
    example: VacancyStatus.INTERVIEW,
  })
  @IsOptional()
  @IsEnum(VacancyStatus)
  readonly status?: VacancyStatus;

  @ApiProperty({
    required: false,
    description: 'Target position inside status column (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly position?: number;

  @ApiProperty({
    required: false,
    description: 'Vacancy URL',
    example: 'https://example.com/vacancy',
  })
  @IsOptional()
  @IsString()
  readonly url?: string;

  @ApiProperty({
    required: false,
    description: 'Parsed vacancy data',
    type: VacancyDataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VacancyDataDto)
  readonly parsedData?: VacancyDataDto;
}
