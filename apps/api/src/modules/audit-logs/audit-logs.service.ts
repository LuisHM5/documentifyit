import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogsRepo: Repository<AuditLogEntity>,
  ) {}

  async findAll(orgId: string): Promise<AuditLogEntity[]> {
    return this.auditLogsRepo.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async log(data: Partial<AuditLogEntity>): Promise<AuditLogEntity> {
    const entry = this.auditLogsRepo.create(data);
    return this.auditLogsRepo.save(entry);
  }
}
