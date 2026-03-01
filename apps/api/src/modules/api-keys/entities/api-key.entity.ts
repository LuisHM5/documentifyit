import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiKeyScope } from '@documentifyit/shared';

@Entity('api_keys')
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @Column({ type: 'varchar' })
  declare name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', name: 'key_hash' })
  declare keyHash: string;

  @Column({ type: 'simple-array', default: '' })
  declare scopes: ApiKeyScope[];

  @Column({ type: 'timestamptz', name: 'last_used_at', nullable: true })
  declare lastUsedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  declare expiresAt: Date | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  declare isActive: boolean;

  @Column({ type: 'uuid', name: 'created_by_id' })
  declare createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;
}
