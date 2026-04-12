import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/users/user.entity';
import { Vacancy } from '@/vacancies/vacancy.entity';
import { Resume } from '@/resume/resume.entity';
import { ResumeAnalysisStatus } from './presentation/types/resume-analysis';
import type {
  KeySkillMatch,
  SectionChangeSummary,
  SuggestedContentPatch,
} from './presentation/types/resume-analysis';

@Entity('resume_analyses')
@Unique(['userId', 'vacancyId'])
@Index(['userId'])
@Index(['vacancyId'])
export class ResumeAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'vacancy_id' })
  vacancyId: string;

  @ManyToOne(() => Vacancy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @Column({ type: 'uuid', name: 'source_resume_id', nullable: true })
  sourceResumeId: string | null;

  @ManyToOne(() => Resume, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'source_resume_id' })
  sourceResume: Resume | null;

  @Column({
    type: 'enum',
    enum: ResumeAnalysisStatus,
    default: ResumeAnalysisStatus.PROCESSING,
  })
  status: ResumeAnalysisStatus;

  @Column({ type: 'int', name: 'initial_ats_score', nullable: true })
  initialAtsScore: number | null;

  @Column({ type: 'int', name: 'initial_match_score', nullable: true })
  initialMatchScore: number | null;

  @Column({ type: 'jsonb', name: 'key_skills_match', nullable: true })
  keySkillsMatch: KeySkillMatch[] | null;

  @Column({ type: 'jsonb', nullable: true })
  strengths: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  improvements: string[] | null;

  @Column({ type: 'jsonb', name: 'suggested_content', nullable: true })
  suggestedContent: SuggestedContentPatch | null;

  @Column({ type: 'jsonb', name: 'section_changes', nullable: true })
  sectionChanges: Record<string, SectionChangeSummary> | null;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
