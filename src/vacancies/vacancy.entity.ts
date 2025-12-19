import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/users/user.entity';
import { VacancyStatus } from './enums/vacancy-status.enum';
import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';

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

  @ManyToMany(() => User, (user) => user.vacancies)
  @JoinTable({
    name: 'user_vacancies',
    joinColumn: { name: 'vacancy_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
