import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionResourceType } from '@documentifyit/shared';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(
    @Query('resourceId') resourceId: string,
    @Query('resourceType') resourceType: PermissionResourceType,
  ) {
    return this.permissionsService.findByResource(resourceId, resourceType);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.permissionsService.create(body);
  }
}
