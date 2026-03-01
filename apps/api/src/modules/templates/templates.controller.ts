import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  findAll() {
    return this.templatesService.findAll('org-placeholder');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findById(id, 'org-placeholder');
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.templatesService.create(body);
  }
}
