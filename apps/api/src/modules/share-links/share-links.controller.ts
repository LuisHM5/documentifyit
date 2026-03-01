import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShareLinksService } from './share-links.service';

@ApiTags('share-links')
@ApiBearerAuth()
@Controller('share')
export class ShareLinksController {
  constructor(private readonly shareLinksService: ShareLinksService) {}

  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.shareLinksService.findByToken(token);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.shareLinksService.create(body);
  }
}
