import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('approval_flows')
export class ApprovalFlowEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare name: string;

  @Column({ type: 'jsonb', default: [] })
  declare steps: Record<string, unknown>[];

  @Column({ type: 'uuid', name: 'document_type_id', nullable: true })
  declare documentTypeId: string | null;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
