import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from './entities/document.entity';
import { DocumentVersionEntity } from '../document-versions/entities/document-version.entity';
import { DocumentStatus } from '@documentifyit/shared';

const APPROVAL_STATE_MACHINE: Partial<Record<DocumentStatus, DocumentStatus[]>> = {
  [DocumentStatus.Draft]: [DocumentStatus.Submitted],
  [DocumentStatus.Submitted]: [DocumentStatus.InReview, DocumentStatus.Draft],
  [DocumentStatus.InReview]: [
    DocumentStatus.Approved,
    DocumentStatus.Rejected,
    DocumentStatus.RevisionRequested,
  ],
  [DocumentStatus.RevisionRequested]: [DocumentStatus.Draft],
  [DocumentStatus.Approved]: [DocumentStatus.Archived],
  [DocumentStatus.Rejected]: [DocumentStatus.Draft],
  [DocumentStatus.Archived]: [],
};

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentsRepo: Repository<DocumentEntity>,
    @InjectRepository(DocumentVersionEntity)
    private readonly versionsRepo: Repository<DocumentVersionEntity>,
  ) {}

  async findAll(orgId: string): Promise<DocumentEntity[]> {
    return this.documentsRepo.find({
      where: { orgId, isDeleted: false },
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string, orgId: string): Promise<DocumentEntity> {
    const doc = await this.documentsRepo.findOne({
      where: { id, orgId, isDeleted: false },
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async create(data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const doc = this.documentsRepo.create({
      ...data,
      version: 1,
      status: DocumentStatus.Draft,
    });
    const saved = await this.documentsRepo.save(doc);

    // Create initial version snapshot
    await this.versionsRepo.save(
      this.versionsRepo.create({
        documentId: saved.id,
        content: saved.content ?? {},
        versionNumber: 1,
        authorId: saved.ownerId,
      }),
    );

    return saved;
  }

  async update(
    id: string,
    orgId: string,
    data: Partial<DocumentEntity>,
    authorId?: string,
  ): Promise<DocumentEntity> {
    const doc = await this.findById(id, orgId);
    const contentChanged =
      data.content !== undefined &&
      JSON.stringify(data.content) !== JSON.stringify(doc.content);

    Object.assign(doc, data);

    // Auto-increment version and snapshot when content changes
    if (contentChanged) {
      doc.version = doc.version + 1;
      await this.versionsRepo.save(
        this.versionsRepo.create({
          documentId: doc.id,
          content: data.content ?? {},
          versionNumber: doc.version,
          authorId: authorId ?? doc.ownerId,
        }),
      );
    }

    return this.documentsRepo.save(doc);
  }

  async transition(
    id: string,
    orgId: string,
    toStatus: DocumentStatus,
    actorId: string,
    comment?: string,
  ): Promise<DocumentEntity> {
    const doc = await this.findById(id, orgId);
    const allowed = APPROVAL_STATE_MACHINE[doc.status] ?? [];

    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${doc.status}" to "${toStatus}"`,
      );
    }

    if (
      (toStatus === DocumentStatus.Rejected ||
        toStatus === DocumentStatus.RevisionRequested) &&
      !comment
    ) {
      throw new BadRequestException(
        `A comment is required when rejecting or requesting revision`,
      );
    }

    doc.status = toStatus;
    const saved = await this.documentsRepo.save(doc);

    // Snapshot on submission so reviewers see a stable copy
    if (toStatus === DocumentStatus.Submitted) {
      await this.versionsRepo.save(
        this.versionsRepo.create({
          documentId: doc.id,
          content: doc.content,
          versionNumber: doc.version,
          authorId: actorId,
        }),
      );
    }

    return saved;
  }

  async softDelete(id: string, orgId: string): Promise<void> {
    const doc = await this.findById(id, orgId);
    doc.isDeleted = true;
    await this.documentsRepo.save(doc);
  }

  async getVersions(id: string, orgId: string): Promise<DocumentVersionEntity[]> {
    await this.findById(id, orgId); // access check
    return this.versionsRepo.find({
      where: { documentId: id },
      order: { versionNumber: 'DESC' },
    });
  }

  async restoreVersion(
    id: string,
    orgId: string,
    versionNumber: number,
    actorId: string,
  ): Promise<DocumentEntity> {
    await this.findById(id, orgId); // access check — throws 404 if not found
    const version = await this.versionsRepo.findOne({
      where: { documentId: id, versionNumber },
    });
    if (!version) throw new NotFoundException(`Version ${versionNumber} not found`);

    return this.update(id, orgId, { content: version.content }, actorId);
  }
}
