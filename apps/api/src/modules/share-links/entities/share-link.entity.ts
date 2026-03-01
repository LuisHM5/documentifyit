import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('share_links')
export class ShareLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Index()
  @Column({ type: 'uuid', name: 'document_id' })
  declare documentId: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  declare token: string;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  declare expiresAt: Date | null;

  @Column({ type: 'varchar', name: 'password_hash', nullable: true })
  declare passwordHash: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  declare isActive: boolean;

  @Column({ type: 'uuid', name: 'created_by_id' })
  declare createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;
}
