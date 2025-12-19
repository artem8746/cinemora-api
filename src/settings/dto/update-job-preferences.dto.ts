import { IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class WorkTypeDto {
  @ApiProperty({
    description: 'Full-time work preference',
    example: true,
  })
  @IsBoolean()
  fullTime: boolean;

  @ApiProperty({
    description: 'Contract work preference',
    example: false,
  })
  @IsBoolean()
  contract: boolean;

  @ApiProperty({
    description: 'Part-time work preference',
    example: false,
  })
  @IsBoolean()
  partTime: boolean;
}

class RemoteDto {
  @ApiProperty({
    description: 'Remote only preference',
    example: true,
  })
  @IsBoolean()
  remoteOnly: boolean;

  @ApiProperty({
    description: 'Hybrid acceptable',
    example: true,
  })
  @IsBoolean()
  hybridAcceptable: boolean;

  @ApiProperty({
    description: 'Office acceptable',
    example: false,
  })
  @IsBoolean()
  officeAcceptable: boolean;
}

class CompanySizeDto {
  @ApiProperty({
    description: 'Startup (1-50 employees) preference',
    example: true,
  })
  @IsBoolean()
  startup: boolean;

  @ApiProperty({
    description: 'Mid-size (50-500 employees) preference',
    example: true,
  })
  @IsBoolean()
  midSize: boolean;

  @ApiProperty({
    description: 'Enterprise (500+ employees) preference',
    example: false,
  })
  @IsBoolean()
  enterprise: boolean;
}

export class UpdateJobPreferencesDto {
  @ApiProperty({
    description: 'Work type preferences',
    type: WorkTypeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WorkTypeDto)
  workType: WorkTypeDto;

  @ApiProperty({
    description: 'Remote work preferences',
    type: RemoteDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RemoteDto)
  remote: RemoteDto;

  @ApiProperty({
    description: 'Company size preferences',
    type: CompanySizeDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CompanySizeDto)
  companySize: CompanySizeDto;
}
