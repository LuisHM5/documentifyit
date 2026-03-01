import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgsRepo: Repository<OrganizationEntity>,
  ) {}

  async findById(id: string): Promise<OrganizationEntity> {
    const org = await this.orgsRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async create(name: string): Promise<OrganizationEntity> {
    const org = this.orgsRepo.create({ name });
    return this.orgsRepo.save(org);
  }
}
