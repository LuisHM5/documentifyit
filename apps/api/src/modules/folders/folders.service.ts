import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderEntity } from './entities/folder.entity';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private readonly foldersRepo: Repository<FolderEntity>,
  ) {}

  async findAll(orgId: string): Promise<FolderEntity[]> {
    return this.foldersRepo.find({ where: { orgId } });
  }

  async findById(id: string, orgId: string): Promise<FolderEntity> {
    const folder = await this.foldersRepo.findOne({ where: { id, orgId } });
    if (!folder) throw new NotFoundException(`Folder ${id} not found`);
    return folder;
  }

  async create(data: Partial<FolderEntity>): Promise<FolderEntity> {
    const folder = this.foldersRepo.create(data);
    return this.foldersRepo.save(folder);
  }
}
