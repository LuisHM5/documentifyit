import { Controller, Get, Post, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { ApprovalFlowsService } from './approval-flows.service';

class ApprovalStepDto {
  @IsString()
  @IsNotEmpty()
  declare assigneeRole: string;

  @IsNumber()
  declare order: number;

  @IsOptional()
  @IsString()
  label?: string;
}

class CreateApprovalFlowDto {
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  steps: ApprovalStepDto[] = [];

  @IsOptional()
  @IsString()
  documentTypeId?: string;
}

@ApiTags('approval-flows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approval-flows')
export class ApprovalFlowsController {
  constructor(private readonly flowsService: ApprovalFlowsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.flowsService.findAll(user.orgId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.flowsService.findById(id, user.orgId);
  }

  @Post()
  create(@Body() body: CreateApprovalFlowDto, @CurrentUser() user: JwtPayload) {
    return this.flowsService.create({
      name: body.name,
      steps: body.steps as unknown as Record<string, unknown>[],
      documentTypeId: body.documentTypeId ?? null,
      orgId: user.orgId,
    });
  }
}
