import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../documents/entities/document.entity';
import { DocumentStatus } from '@documentifyit/shared';

export interface SearchQuery {
  q: string;
  orgId: string;
  status?: string;
  folderId?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'document';
  status: string;
  tags: string[];
  folderId: string | null;
  updatedAt: Date;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentsRepo: Repository<DocumentEntity>,
  ) {}

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const { q, orgId, status, folderId, tags, fromDate, toDate, page = 1, limit = 20 } = query;

    if (!q || q.trim().length === 0) return [];

    const skip = (page - 1) * limit;
    const term = `%${q.toLowerCase()}%`;

    const qb = this.documentsRepo
      .createQueryBuilder('doc')
      .where('doc.org_id = :orgId', { orgId })
      .andWhere('doc.is_deleted = false')
      .andWhere(
        '(LOWER(doc.title) LIKE :term OR CAST(doc.content AS text) ILIKE :term)',
        { term },
      )
      .orderBy('doc.updated_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (status && Object.values(DocumentStatus).includes(status as DocumentStatus)) {
      qb.andWhere('doc.status = :status', { status });
    }

    if (folderId) {
      qb.andWhere('doc.folder_id = :folderId', { folderId });
    }

    if (tags && tags.length > 0) {
      qb.andWhere('doc.tags && :tags', { tags });
    }

    if (fromDate) {
      qb.andWhere('doc.updated_at >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      qb.andWhere('doc.updated_at <= :toDate', { toDate: new Date(toDate) });
    }

    const docs = await qb.getMany();

    return docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      excerpt: this.extractExcerpt(doc.content, q),
      type: 'document' as const,
      status: doc.status,
      tags: doc.tags,
      folderId: doc.folderId,
      updatedAt: doc.updatedAt,
    }));
  }

  private extractExcerpt(content: Record<string, unknown>, query: string): string {
    try {
      const blocks = content['content'] as Array<Record<string, unknown>> | undefined;
      if (!blocks) return '';
      const lowerQ = query.toLowerCase();
      for (const block of blocks) {
        const inlineContent = block['content'] as Array<Record<string, unknown>> | undefined;
        if (inlineContent) {
          const text = inlineContent
            .map((inline) => inline['text'] as string | undefined)
            .filter(Boolean)
            .join('');
          if (text.length > 0) {
            // Try to find the query term in the text for a contextual snippet
            const idx = text.toLowerCase().indexOf(lowerQ);
            if (idx !== -1) {
              const start = Math.max(0, idx - 60);
              const end = Math.min(text.length, idx + 140);
              return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
            }
            if (text.length > 0) return text.slice(0, 200);
          }
        }
      }
    } catch {
      // ignore
    }
    return '';
  }

  indexDocument(_documentId: string, _content: Record<string, unknown>): void {
    this.logger.debug(`Document indexed (PostgreSQL ILIKE search)`);
  }

  deleteDocument(_documentId: string): void {
    this.logger.debug(`Document removed from index`);
  }
}
