import { User } from '@/users/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

export enum ConnectedAccountProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

@Entity('connected_accounts')
@Unique(['userId', 'provider'])
@Index(['userId'])
export class ConnectedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ConnectedAccountProvider,
  })
  provider: ConnectedAccountProvider;

  @Column({ name: 'provider_account_id' })
  providerAccountId: string;

  @Column({ name: 'provider_account_email', nullable: true })
  providerAccountEmail?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
