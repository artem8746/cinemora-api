import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/users/user.entity';
import { VacancyStatus } from './enums/vacancy-status.enum';
import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';
import { Company } from '@/companies/company.entity';
import { VacancyNote } from './vacancy-note.entity';

@Entity('vacancies')
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  url?: string | null;

  @Column({
    type: 'enum',
    enum: VacancyStatus,
    default: VacancyStatus.SENT_CV,
  })
  status: VacancyStatus;

  @Column({
    type: 'jsonb',
    name: 'parsed_data',
  })
  parsedData: ParsedVacancyData;

  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId?: string | null;

  @ManyToOne(() => Company, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company?: Company | null;

  @ManyToMany(() => User, (user) => user.vacancies)
  @JoinTable({
    name: 'user_vacancies',
    joinColumn: { name: 'vacancy_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @OneToMany(() => VacancyNote, (note) => note.vacancy)
  notes?: VacancyNote[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
