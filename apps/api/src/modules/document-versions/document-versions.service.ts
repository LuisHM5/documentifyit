import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersionEntity } from './entities/document-version.entity';

@Injectable()
export class DocumentVersionsService {
  constructor(
    @InjectRepository(DocumentVersionEntity)
    private readonly versionsRepo: Repository<DocumentVersionEntity>,
  ) {}

  async findByDocument(documentId: string): Promise<DocumentVersionEntity[]> {
    return this.versionsRepo.find({
      where: { documentId },
      order: { versionNumber: 'DESC' },
    });
  }

  async create(data: Partial<DocumentVersionEntity>): Promise<DocumentVersionEntity> {
    const version = this.versionsRepo.create(data);
    return this.versionsRepo.save(version);
  }
}
