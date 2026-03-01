import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrgPlan, OrganizationSettings } from '@documentifyit/shared';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare name: string;

  @Column({ type: 'enum', enum: OrgPlan, default: OrgPlan.Free })
  declare plan: OrgPlan;

  @Column({ type: 'jsonb', default: {} })
  declare settings: OrganizationSettings;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
