import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateEntity } from './entities/template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templatesRepo: Repository<TemplateEntity>,
  ) {}

  async findAll(orgId: string): Promise<TemplateEntity[]> {
    return this.templatesRepo.find({ where: { orgId } });
  }

  async findById(id: string, orgId: string): Promise<TemplateEntity> {
    const template = await this.templatesRepo.findOne({ where: { id, orgId } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return template;
  }

  async create(data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    const template = this.templatesRepo.create(data);
    return this.templatesRepo.save(template);
  }

  async update(id: string, orgId: string, data: Partial<TemplateEntity>): Promise<TemplateEntity> {
    const template = await this.findById(id, orgId);
    Object.assign(template, data);
    return this.templatesRepo.save(template);
  }

  async remove(id: string, orgId: string): Promise<void> {
    const template = await this.findById(id, orgId);
    await this.templatesRepo.remove(template);
  }
}
