import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseVacancyFromTextDto {
  @ApiProperty({
    description: 'Vacancy text content to parse',
    example: 'We are looking for a Senior Backend Developer...',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
