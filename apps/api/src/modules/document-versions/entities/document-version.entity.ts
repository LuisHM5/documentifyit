import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('document_versions')
export class DocumentVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Index()
  @Column({ type: 'uuid', name: 'document_id' })
  declare documentId: string;

  /**
   * JSONB snapshot — stored as a BlockNote Block[] array.
   * Typed as `unknown` to accept both array and legacy object shapes.
   */
  @Column({ type: 'jsonb' })
  declare content: unknown;

  @Column({ type: 'int', name: 'version_number' })
  declare versionNumber: number;

  @Column({ type: 'uuid', name: 'author_id' })
  declare authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;
}
