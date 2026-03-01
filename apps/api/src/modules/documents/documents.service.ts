import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentsRepo: Repository<DocumentEntity>,
  ) {}

  async findAll(orgId: string): Promise<DocumentEntity[]> {
    return this.documentsRepo.find({ where: { orgId, isDeleted: false } });
  }

  async findById(id: string, orgId: string): Promise<DocumentEntity> {
    const doc = await this.documentsRepo.findOne({
      where: { id, orgId, isDeleted: false },
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async create(data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const doc = this.documentsRepo.create(data);
    return this.documentsRepo.save(doc);
  }

  async update(id: string, orgId: string, data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const doc = await this.findById(id, orgId);
    Object.assign(doc, data);
    return this.documentsRepo.save(doc);
  }

  async softDelete(id: string, orgId: string): Promise<void> {
    const doc = await this.findById(id, orgId);
    doc.isDeleted = true;
    await this.documentsRepo.save(doc);
  }
}
