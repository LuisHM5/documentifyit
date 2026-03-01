import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShareLinkEntity } from './entities/share-link.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ShareLinksService {
  constructor(
    @InjectRepository(ShareLinkEntity)
    private readonly shareLinksRepo: Repository<ShareLinkEntity>,
  ) {}

  async findByToken(token: string): Promise<ShareLinkEntity> {
    const link = await this.shareLinksRepo.findOne({ where: { token, isActive: true } });
    if (!link) throw new NotFoundException('Share link not found or expired');
    return link;
  }

  async create(data: Partial<ShareLinkEntity>): Promise<ShareLinkEntity> {
    const link = this.shareLinksRepo.create({
      ...data,
      token: randomBytes(32).toString('hex'),
    });
    return this.shareLinksRepo.save(link);
  }

  async deactivate(id: string): Promise<void> {
    await this.shareLinksRepo.update(id, { isActive: false });
  }
}
