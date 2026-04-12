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
import { User } from '@/users/user.entity';
import { Vacancy } from '@/vacancies/vacancy.entity';
import type { ParsedResume } from './presentation/types/resume';

@Entity('resumes')
@Index(['userId'])
@Index(['title'])
@Index(['fullName'])
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'vacancy_id', nullable: true })
  vacancyId: string | null;

  @ManyToOne(() => Vacancy, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy | null;

  @Column({ type: 'uuid', name: 'analysis_id', nullable: true })
  analysisId: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 255, name: 'job_title', nullable: true })
  jobTitle?: string | null;

  @Column({
    type: 'jsonb',
    name: 'parsed_data',
  })
  parsedData: Omit<ParsedResume, 'id' | 'userId' | 'title'> & {
    personalDetails: Omit<
      ParsedResume['personalDetails'],
      'fullName' | 'jobTitle'
    >;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
