import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  body: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
