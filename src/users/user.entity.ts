import { Token } from '@/tokens/token.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  password?: string;

  @Column({ default: false, name: 'is_confirmed' })
  isConfirmed: boolean;

  @Column({ nullable: true, type: 'varchar' })
  avatar?: string;

  @Column({ default: 0, type: 'integer' })
  credits: number;

  @Column({ nullable: true, type: 'varchar' })
  username?: string;

  @Column({ nullable: true, type: 'varchar' })
  position?: string;

  @Column({ nullable: true, type: 'varchar' })
  location?: string;

  // Security settings
  @Column({ default: false, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Column({ nullable: true, name: 'password_changed_at', type: 'timestamptz' })
  passwordChangedAt?: Date;

  @Column({ default: false, name: 'is_2fa_enabled' })
  is2FAEnabled: boolean;

  @Column({ nullable: true, name: 'two_factor_secret', type: 'varchar' })
  twoFactorSecret?: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
