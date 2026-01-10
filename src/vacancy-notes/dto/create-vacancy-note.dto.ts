import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VacancyNoteType } from '@/vacancies/enums/vacancy-note-type.enum';

export class CreateVacancyNoteDto {
  @ApiProperty({
    description: 'Type of the note',
    enum: VacancyNoteType,
    example: VacancyNoteType.GENERAL_NOTE,
  })
  @IsEnum(VacancyNoteType)
  @IsNotEmpty()
  type!: VacancyNoteType;

  @ApiProperty({
    description: 'Title of the note (optional)',
    example: 'Interview preparation',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Content of the note',
    example: 'Prepare questions about the company culture and team structure',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
