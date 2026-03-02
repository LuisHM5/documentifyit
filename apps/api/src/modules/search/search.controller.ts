import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q: string,
    @Query('status') status: string | undefined,
    @Query('folderId') folderId: string | undefined,
    @Query('tags') tags: string | undefined,
    @Query('fromDate') fromDate: string | undefined,
    @Query('toDate') toDate: string | undefined,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.searchService.search({
      q,
      orgId: user.orgId,
      status,
      folderId,
      tags: tags ? tags.split(',') : undefined,
      fromDate,
      toDate,
      page: Number(page),
      limit: Number(limit),
    });
  }
}
