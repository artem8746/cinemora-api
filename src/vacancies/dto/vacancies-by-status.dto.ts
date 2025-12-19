import { ApiProperty } from '@nestjs/swagger';
import { Vacancy } from '../vacancy.entity';
import { VacancyStatus } from '../enums/vacancy-status.enum';

export class VacanciesByStatusDto {
  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: sent_cv',
  })
  [VacancyStatus.SENT_CV]: Vacancy[];

  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: followup',
  })
  [VacancyStatus.FOLLOWUP]: Vacancy[];

  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: test_task',
  })
  [VacancyStatus.TEST_TASK]: Vacancy[];

  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: interview',
  })
  [VacancyStatus.INTERVIEW]: Vacancy[];

  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: rejected',
  })
  [VacancyStatus.REJECTED]: Vacancy[];

  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: offer',
  })
  [VacancyStatus.OFFER]: Vacancy[];

  @ApiProperty({
    type: [Vacancy],
    description: 'Vacancies with status: archived',
  })
  [VacancyStatus.ARCHIVED]: Vacancy[];
}
