import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FoldersService } from './folders.service';

@ApiTags('folders')
@ApiBearerAuth()
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  findAll() {
    return this.foldersService.findAll('org-placeholder');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foldersService.findById(id, 'org-placeholder');
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.foldersService.create(body);
  }
}
