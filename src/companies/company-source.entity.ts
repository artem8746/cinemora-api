import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '@/companies/company.entity';

export enum CompanySourceType {
  VACANCY_TEXT = 'vacancy_text',
  COMPANY_WEBSITE = 'company_website',
}

@Entity('company_sources')
@Index(['companyId', 'collectedAt'])
@Index(['companyId', 'sourceType', 'sourceUrl'], { unique: true })
export class CompanySource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({
    type: 'enum',
    enum: CompanySourceType,
    name: 'source_type',
  })
  sourceType: CompanySourceType;

  @Column({ type: 'text', name: 'source_url' })
  sourceUrl: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @CreateDateColumn({ name: 'collected_at', type: 'timestamptz' })
  collectedAt: Date;
}
