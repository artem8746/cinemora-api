import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyNotesService } from './vacancy-notes.service';
import { VacancyNotesController } from './vacancy-notes.controller';
import { CreateVacancyNoteHandler } from './commands/create-vacancy-note/create-vacancy-note.handler';
import { UpdateVacancyNoteHandler } from './commands/update-vacancy-note/update-vacancy-note.handler';
import { DeleteVacancyNoteHandler } from './commands/delete-vacancy-note/delete-vacancy-note.handler';
import { GetVacancyNotesByVacancyIdHandler } from './queries/get-vacancy-notes-by-vacancy-id/get-vacancy-notes-by-vacancy-id.handler';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';
import { VacanciesModule } from '@/vacancies/vacancies.module';

export const VacancyNotesCommandHandlers = [
  CreateVacancyNoteHandler,
  UpdateVacancyNoteHandler,
  DeleteVacancyNoteHandler,
];

export const VacancyNotesQueryHandlers = [GetVacancyNotesByVacancyIdHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([VacancyNote]),
    VacanciesModule,
  ],
  controllers: [VacancyNotesController],
  providers: [
    VacancyNotesService,
    ...VacancyNotesCommandHandlers,
    ...VacancyNotesQueryHandlers,
  ],
  exports: [VacancyNotesService],
})
export class VacancyNotesModule {}
