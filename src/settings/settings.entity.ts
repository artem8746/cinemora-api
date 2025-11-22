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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
