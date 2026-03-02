import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShareLinkEntity } from './entities/share-link.entity';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

export interface CreateShareLinkData {
  documentId: string;
  createdById: string;
  expiresAt?: Date;
  password?: string;
}

@Injectable()
export class ShareLinksService {
  constructor(
    @InjectRepository(ShareLinkEntity)
    private readonly shareLinksRepo: Repository<ShareLinkEntity>,
  ) {}

  async findByToken(token: string, password?: string): Promise<ShareLinkEntity> {
    const link = await this.shareLinksRepo.findOne({ where: { token, isActive: true } });
    if (!link) throw new NotFoundException('Share link not found or inactive');

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new ForbiddenException('Share link has expired');
    }

    if (link.passwordHash) {
      if (!password) throw new ForbiddenException('This link is password protected');
      const valid = await bcrypt.compare(password, link.passwordHash);
      if (!valid) throw new ForbiddenException('Incorrect password');
    }

    return link;
  }

  async create(data: CreateShareLinkData): Promise<ShareLinkEntity> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
    const link = this.shareLinksRepo.create({
      documentId: data.documentId,
      createdById: data.createdById,
      expiresAt: data.expiresAt ?? null,
      passwordHash,
      token: randomBytes(32).toString('hex'),
    });
    return this.shareLinksRepo.save(link);
  }

  async deactivate(id: string): Promise<void> {
    await this.shareLinksRepo.update(id, { isActive: false });
  }
}
