import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { ApiKeyEntity } from './entities/api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeysRepo: Repository<ApiKeyEntity>,
  ) {}

  async findAllByOrg(orgId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeysRepo.find({ where: { orgId, isActive: true } });
  }

  /** Returns the raw key (only shown once on creation) */
  async create(data: Partial<ApiKeyEntity>): Promise<{ key: string; entity: ApiKeyEntity }> {
    const rawKey = randomBytes(32).toString('hex');
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const entity = this.apiKeysRepo.create({ ...data, keyHash });
    await this.apiKeysRepo.save(entity);
    return { key: rawKey, entity };
  }

  async validateKey(rawKey: string): Promise<ApiKeyEntity | null> {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    return this.apiKeysRepo.findOne({ where: { keyHash, isActive: true } });
  }

  async revoke(id: string): Promise<void> {
    await this.apiKeysRepo.update(id, { isActive: false });
  }
}
