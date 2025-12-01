import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SalaryExpectationsDto {
  @ApiProperty({
    description: 'Minimum salary expectation',
    example: 80000,
  })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty({
    description: 'Maximum salary expectation',
    example: 120000,
  })
  @IsNumber()
  @Min(0)
  max: number;
}

export class UpdatePersonalInfoDto {
  @ApiProperty({
    description: 'Target role or position',
    example: 'Senior Frontend Developer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  targetRole: string;

  @ApiProperty({
    description: 'Years of experience range',
    example: '5-7 years',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  yearsOfExperience: string;

  @ApiProperty({
    description: 'Location preferences',
    example: ['Kyiv, Ukraine', 'Remote (Europe)'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  locationPreferences: string[];

  @ApiProperty({
    description: 'Salary expectations',
    type: SalaryExpectationsDto,
  })
  @IsNotEmpty()
  salaryExpectations: SalaryExpectationsDto;

  @ApiProperty({
    description: 'Top skills',
    example: ['React', 'TypeScript', 'Node'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  topSkills: string[];
}
