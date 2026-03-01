import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApprovalFlowEntity } from './entities/approval-flow.entity';

@Injectable()
export class ApprovalFlowsService {
  constructor(
    @InjectRepository(ApprovalFlowEntity)
    private readonly flowsRepo: Repository<ApprovalFlowEntity>,
  ) {}

  async findAll(orgId: string): Promise<ApprovalFlowEntity[]> {
    return this.flowsRepo.find({ where: { orgId } });
  }

  async findById(id: string, orgId: string): Promise<ApprovalFlowEntity> {
    const flow = await this.flowsRepo.findOne({ where: { id, orgId } });
    if (!flow) throw new NotFoundException(`ApprovalFlow ${id} not found`);
    return flow;
  }

  async create(data: Partial<ApprovalFlowEntity>): Promise<ApprovalFlowEntity> {
    const flow = this.flowsRepo.create(data);
    return this.flowsRepo.save(flow);
  }
}
