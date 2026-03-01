import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';

@ApiTags('api-keys')
@ApiBearerAuth()
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  findAll() {
    return this.apiKeysService.findAllByOrg('org-placeholder');
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.apiKeysService.create(body);
  }

  @Delete(':id')
  revoke(@Param('id') id: string) {
    return this.apiKeysService.revoke(id);
  }
}
