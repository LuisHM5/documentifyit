import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString, IsString, MinLength, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { ShareLinksService } from './share-links.service';

class CreateShareLinkDto {
  @IsUUID()
  declare documentId: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password?: string;
}

@ApiTags('share-links')
@ApiBearerAuth()
@Controller('share')
export class ShareLinksController {
  constructor(private readonly shareLinksService: ShareLinksService) {}

  /** Public — anyone with the token can read */
  @Get(':token')
  findByToken(@Param('token') token: string) {
    return this.shareLinksService.findByToken(token);
  }

  /** Protected — must be authenticated to create */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreateShareLinkDto, @CurrentUser() user: JwtPayload) {
    return this.shareLinksService.create({
      documentId: body.documentId,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      password: body.password,
      createdById: user.sub,
    });
  }

  /** Protected — deactivate a share link */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.shareLinksService.deactivate(id);
  }
}
