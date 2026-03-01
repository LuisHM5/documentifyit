import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    // TODO: extract orgId from JWT guard
    return this.documentsService.findAll('org-placeholder');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findById(id, 'org-placeholder');
  }

  @Post()
  create(@Body() body: Partial<{ title: string; content: Record<string, unknown> }>) {
    return this.documentsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ title: string; content: Record<string, unknown> }>) {
    return this.documentsService.update(id, 'org-placeholder', body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.softDelete(id, 'org-placeholder');
  }
}
