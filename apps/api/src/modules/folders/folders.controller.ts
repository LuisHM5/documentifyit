import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@ApiTags('folders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.foldersService.findAll(user.orgId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.foldersService.findById(id, user.orgId);
  }

  @Post()
  create(@Body() body: CreateFolderDto, @CurrentUser() user: JwtPayload) {
    return this.foldersService.create({ ...body, orgId: user.orgId });
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.foldersService.remove(id, user.orgId);
  }
}
