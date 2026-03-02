import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentStatus } from '@documentifyit/shared';

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare title: string;

  /**
   * Stored as JSONB. In practice this is a BlockNote Block[] array, but we type
   * it as `unknown` so TypeScript accepts both the legacy `{}` default and the
   * runtime array without unsafe casts throughout the service layer.
   */
  @Column({ type: 'jsonb', default: '[]' })
  declare content: unknown;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.Draft })
  declare status: DocumentStatus;

  @Index()
  @Column({ type: 'uuid', name: 'owner_id' })
  declare ownerId: string;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @Column({ type: 'uuid', name: 'folder_id', nullable: true })
  declare folderId: string | null;

  @Column({ type: 'int', default: 1 })
  declare version: number;

  @Column({ type: 'text', array: true, default: [] })
  declare tags: string[];

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  declare isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
