import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAISettingsDto {
  @ApiProperty({
    description: 'Writing style preference',
    enum: ['professional-balanced', 'creative'],
    example: 'professional-balanced',
  })
  @IsEnum(['professional-balanced', 'creative'])
  @IsNotEmpty()
  writingStyle: 'professional-balanced' | 'creative';

  @ApiProperty({
    description: 'Cover letter tone',
    enum: ['enthusiastic-professional', 'friendly'],
    example: 'enthusiastic-professional',
  })
  @IsEnum(['enthusiastic-professional', 'friendly'])
  @IsNotEmpty()
  coverLetterTone: 'enthusiastic-professional' | 'friendly';

  @ApiProperty({
    description: 'Resume optimization level',
    enum: ['aggressive', 'conservative'],
    example: 'aggressive',
  })
  @IsEnum(['aggressive', 'conservative'])
  @IsNotEmpty()
  resumeOptimization: 'aggressive' | 'conservative';

  @ApiProperty({
    description: 'Language for generated content',
    enum: ['english', 'ukrainian'],
    example: 'english',
  })
  @IsEnum(['english', 'ukrainian'])
  @IsNotEmpty()
  generatedContentLang: 'english' | 'ukrainian';
}
