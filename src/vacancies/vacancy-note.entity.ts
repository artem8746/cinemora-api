import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vacancy } from './vacancy.entity';
import { VacancyNoteType } from './enums/vacancy-note-type.enum';

@Entity('vacancy_notes')
@Index(['vacancyId'])
@Index(['vacancyId', 'createdAt'])
export class VacancyNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'vacancy_id' })
  vacancyId: string;

  @ManyToOne(() => Vacancy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @Column({
    type: 'enum',
    enum: VacancyNoteType,
  })
  type: VacancyNoteType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
