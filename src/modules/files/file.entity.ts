import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FileType {
  AVATAR = 'avatar',
  RESUME = 'resume',
}

@Entity('files')
@Index(['userId', 'fileType'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: FileType,
    name: 'file_type',
  })
  fileType: FileType;

  @Column({ type: 'varchar', length: 500 })
  key: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'integer', name: 'size_bytes' })
  sizeBytes: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'uploaded_at' })
  uploadedAt: Date;
}
