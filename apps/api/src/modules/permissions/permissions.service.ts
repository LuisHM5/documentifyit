import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionResourceType } from '@documentifyit/shared';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepo: Repository<PermissionEntity>,
  ) {}

  async findByResource(
    resourceId: string,
    resourceType: PermissionResourceType,
  ): Promise<PermissionEntity[]> {
    return this.permissionsRepo.find({ where: { resourceId, resourceType } });
  }

  async create(data: Partial<PermissionEntity>): Promise<PermissionEntity> {
    const perm = this.permissionsRepo.create(data);
    return this.permissionsRepo.save(perm);
  }
}
