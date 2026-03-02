import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentStatus } from '@documentifyit/shared';

class TransitionDto {
  @IsEnum(DocumentStatus)
  declare status: DocumentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.documentsService.findAll(user.orgId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.documentsService.findById(id, user.orgId);
  }

  @Post()
  create(@Body() body: CreateDocumentDto, @CurrentUser() user: JwtPayload) {
    return this.documentsService.create({
      ...body,
      orgId: user.orgId,
      ownerId: user.sub,
    });
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.update(id, user.orgId, body, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.documentsService.softDelete(id, user.orgId);
  }

  /** GET /documents/:id/versions — list all versions */
  @Get(':id/versions')
  getVersions(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.documentsService.getVersions(id, user.orgId);
  }

  /** POST /documents/:id/versions/:versionNumber/restore — restore a version */
  @Post(':id/versions/:versionNumber/restore')
  restoreVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.restoreVersion(id, user.orgId, versionNumber, user.sub);
  }

  /** POST /documents/:id/transition — approval state machine */
  @Post(':id/transition')
  @HttpCode(HttpStatus.OK)
  transition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: TransitionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.documentsService.transition(id, user.orgId, body.status, user.sub, body.comment);
  }
}
