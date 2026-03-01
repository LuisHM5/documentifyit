import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TemplateVariable } from '@documentifyit/shared';

@Entity('templates')
export class TemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare name: string;

  @Column({ type: 'varchar', default: '' })
  declare description: string;

  @Column({ type: 'jsonb', default: {} })
  declare content: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  declare variables: TemplateVariable[];

  @Column({ type: 'boolean', name: 'is_ai', default: false })
  declare isAI: boolean;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
