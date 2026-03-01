import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare action: string;

  @Index()
  @Column({ type: 'uuid', name: 'actor_id' })
  declare actorId: string;

  @Column({ type: 'uuid', name: 'resource_id', nullable: true })
  declare resourceId: string | null;

  @Column({ type: 'varchar', name: 'resource_type', nullable: true })
  declare resourceType: string | null;

  @Column({ type: 'jsonb', nullable: true })
  declare metadata: Record<string, unknown> | null;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  declare ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;
}
