import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { CompanyReviewsSummary } from '@/openai/types/company-profile.type';

@Entity('companies')
@Index(['normalizedName'], { unique: true })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'display_name', length: 255 })
  displayName: string;

  @Column({ type: 'varchar', name: 'normalized_name', length: 255 })
  normalizedName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string | null;

  @Column({ type: 'text', name: 'page_url', nullable: true })
  pageUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  headquarters?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  size?: string | null;

  @Column({ type: 'jsonb', name: 'reviews_summary', nullable: true })
  reviewsSummary?: CompanyReviewsSummary | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  confidence: number;

  @Column({ type: 'timestamptz', name: 'last_verified_at', nullable: true })
  lastVerifiedAt?: Date | null;

  @Column({ type: 'timestamptz', name: 'next_refresh_at', nullable: true })
  nextRefreshAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
