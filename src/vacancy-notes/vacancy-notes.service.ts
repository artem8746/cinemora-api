import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBus } from '@nestjs/cqrs';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';
import { VacancyNoteType } from '@/vacancies/enums/vacancy-note-type.enum';
import { GetVacancyByIdQuery } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.query';

@Injectable()
export class VacancyNotesService {
  private readonly logger = new Logger(VacancyNotesService.name);

  constructor(
    @InjectRepository(VacancyNote)
    private readonly vacancyNoteRepository: Repository<VacancyNote>,
    private readonly queryBus: QueryBus,
  ) {}

  async createNote(params: {
    vacancyId: string;
    userId: string;
    type: VacancyNoteType;
    title?: string | null;
    content: string;
  }): Promise<VacancyNote> {
    const { vacancyId, userId, type, title, content } = params;
    this.logger.log(
      `Creating note for vacancy ${vacancyId} for user: ${userId}`,
    );

    await this.queryBus.execute(new GetVacancyByIdQuery(vacancyId, userId));

    const note = this.vacancyNoteRepository.create({
      vacancyId,
      type,
      title: title ?? null,
      content,
    });

    const savedNote = await this.vacancyNoteRepository.save(note);
    this.logger.log(`Successfully created note with ID: ${savedNote.id}`);

    return savedNote;
  }

  async findNotesByVacancyId(params: {
    vacancyId: string;
    userId: string;
  }): Promise<VacancyNote[]> {
    const { vacancyId, userId } = params;
    this.logger.log(
      `Finding notes for vacancy ${vacancyId} for user: ${userId}`,
    );

    await this.queryBus.execute(new GetVacancyByIdQuery(vacancyId, userId));

    const notes = await this.vacancyNoteRepository.find({
      where: { vacancyId },
      order: { createdAt: 'DESC' },
    });

    return notes;
  }

  async findNoteById(params: {
    noteId: string;
    userId: string;
  }): Promise<VacancyNote> {
    const { noteId, userId } = params;
    this.logger.log(`Finding note ${noteId} for user: ${userId}`);

    const note = await this.vacancyNoteRepository
      .createQueryBuilder('note')
      .innerJoin('note.vacancy', 'vacancy')
      .innerJoin('vacancy.users', 'user')
      .where('note.id = :noteId', { noteId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (!note) {
      throw new NotFoundException(
        `Note with ID ${noteId} not found or access denied`,
      );
    }

    return note;
  }

  async updateNote(params: {
    noteId: string;
    userId: string;
    updateData: {
      type?: VacancyNoteType;
      title?: string | null;
      content?: string;
    };
  }): Promise<VacancyNote> {
    const { noteId, userId, updateData } = params;
    this.logger.log(`Updating note ${noteId} for user: ${userId}`);

    const note = await this.findNoteById({ noteId, userId });

    Object.assign(note, updateData);

    const updatedNote = await this.vacancyNoteRepository.save(note);
    this.logger.log(`Successfully updated note ${noteId}`);

    return updatedNote;
  }

  async deleteNote(params: { noteId: string; userId: string }): Promise<void> {
    const { noteId, userId } = params;
    this.logger.log(`Deleting note ${noteId} for user: ${userId}`);

    const note = await this.findNoteById({ noteId, userId });

    await this.vacancyNoteRepository.remove(note);
    this.logger.log(`Successfully deleted note ${noteId}`);
  }
}
