import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionLevel, PermissionResourceType } from '@documentifyit/shared';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Index()
  @Column({ type: 'uuid', name: 'resource_id' })
  declare resourceId: string;

  @Column({ type: 'enum', enum: PermissionResourceType, name: 'resource_type' })
  declare resourceType: PermissionResourceType;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  declare userId: string | null;

  @Column({ type: 'uuid', name: 'role_id', nullable: true })
  declare roleId: string | null;

  @Column({ type: 'enum', enum: PermissionLevel })
  declare level: PermissionLevel;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;
}
