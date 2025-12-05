import { User } from '@/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import {
  AppearanceSettings,
  NotificationSettings,
  PersonalInfoSettings,
  AISettings,
  JobPreferencesSettings,
} from './types/settings.types';

@Entity('user_settings')
@Unique(['userId'])
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'jsonb',
    name: 'appearance',
    default: () => "'{}'",
  })
  appearance: AppearanceSettings;

  @Column({
    type: 'jsonb',
    name: 'notifications',
    default: () => "'{}'",
  })
  notifications: NotificationSettings;

  @Column({
    type: 'jsonb',
    name: 'personal_info',
    default: () => "'{}'",
  })
  personalInfo: PersonalInfoSettings;

  @Column({
    type: 'jsonb',
    name: 'ai_settings',
    default: () => "'{}'",
  })
  aiSettings: AISettings;

  @Column({
    type: 'jsonb',
    name: 'job_preferences',
    default: () => "'{}'",
  })
  jobPreferences: JobPreferencesSettings;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
