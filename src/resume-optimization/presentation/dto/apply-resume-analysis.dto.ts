import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class ApplyResumeAnalysisDto {
  @ApiProperty({
    description: 'ATS score at the moment of applying (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  appliedAtsScore: number;

  @ApiProperty({
    description: 'Match score at the moment of applying (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  appliedMatchScore: number;
}
