import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
}
