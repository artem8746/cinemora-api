import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

// Provide exactly one of planId or tokenAmount
export class CreateInvoiceDto {
  @ApiPropertyOptional({
    description: 'Payment plan ID. Mutually exclusive with tokenAmount.',
    example: 'starter',
  })
  @ValidateIf((o: CreateInvoiceDto) => o.tokenAmount === undefined)
  @IsString()
  @IsNotEmpty()
  planId?: string;

  @ApiPropertyOptional({
    description:
      'Number of credits to purchase at the per-unit rate. Mutually exclusive with planId.',
    minimum: 1,
    maximum: 1000,
    example: 25,
  })
  @ValidateIf((o: CreateInvoiceDto) => o.planId === undefined)
  @IsInt()
  @Min(1)
  @Max(1000)
  tokenAmount?: number;
}
