import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalFlowsService } from './approval-flows.service';

@ApiTags('approval-flows')
@ApiBearerAuth()
@Controller('approval-flows')
export class ApprovalFlowsController {
  constructor(private readonly flowsService: ApprovalFlowsService) {}

  @Get()
  findAll() {
    return this.flowsService.findAll('org-placeholder');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flowsService.findById(id, 'org-placeholder');
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.flowsService.create(body);
  }
}
