import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '@documentifyit/shared';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  declare email: string;

  @Column({ type: 'varchar' })
  declare name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Viewer })
  declare role: UserRole;

  @Column({ type: 'varchar', name: 'password_hash' })
  declare passwordHash: string;

  @Index()
  @Column({ type: 'uuid', name: 'org_id' })
  declare orgId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  declare isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  declare createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  declare updatedAt: Date;
}
