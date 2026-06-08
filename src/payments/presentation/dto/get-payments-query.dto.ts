import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ToNumber } from '@/transformers/to-number.transaformer';

export class GetPaymentsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @ToNumber({}, 1)
  @Min(1, { always: false })
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size (max 100)',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @ToNumber({}, 20)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
