import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalFlowEntity } from './entities/approval-flow.entity';
import { ApprovalFlowsService } from './approval-flows.service';
import { ApprovalFlowsController } from './approval-flows.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalFlowEntity])],
  controllers: [ApprovalFlowsController],
  providers: [ApprovalFlowsService],
  exports: [ApprovalFlowsService],
})
export class ApprovalFlowsModule {}
