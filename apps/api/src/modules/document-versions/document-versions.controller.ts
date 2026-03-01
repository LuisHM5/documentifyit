import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentVersionsService } from './document-versions.service';

@ApiTags('document-versions')
@ApiBearerAuth()
@Controller('documents/:documentId/versions')
export class DocumentVersionsController {
  constructor(private readonly versionsService: DocumentVersionsService) {}

  @Get()
  findAll(@Param('documentId') documentId: string) {
    return this.versionsService.findByDocument(documentId);
  }
}
