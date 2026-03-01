import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePdfDto {
  @ApiProperty({
    description: 'HTML content to convert to PDF',
    example: '<h1>Hello World</h1><p>This is a sample HTML content.</p>',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty({ message: 'HTML content is required' })
  @MinLength(1, { message: 'HTML content cannot be empty' })
  html: string;
}
