import {
  Controller,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { AiService } from './ai.service';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsIn(['user', 'assistant', 'system'])
  declare role: 'user' | 'assistant' | 'system';

  @IsString()
  @IsNotEmpty()
  declare content: string;
}

class GenerateDocumentDto {
  @IsString()
  @IsNotEmpty()
  declare prompt: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}

class AssistDocumentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  declare messages: ChatMessageDto[];

  @IsOptional()
  @IsString()
  documentContext?: string;
}

class GenerateTemplateDto {
  @IsString()
  @IsNotEmpty()
  declare description: string;

  @IsOptional()
  @IsString()
  sampleContent?: string;
}

class ValidateDocumentDto {
  @IsOptional()
  content?: Record<string, unknown>;
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/generate/document
   * Streams AI-generated document content as Server-Sent Events (text/event-stream).
   */
  @Post('generate/document')
  async generateDocument(
    @Body() body: GenerateDocumentDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const result = this.aiService.streamGenerateDocument({
      prompt: body.prompt,
      templateId: body.templateId,
      orgId: user.orgId,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  /**
   * POST /ai/assist
   * Streams inline AI assistant response for the document editor.
   */
  @Post('assist')
  async assistDocument(
    @Body() body: AssistDocumentDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const result = this.aiService.streamAssistDocument({
      messages: body.messages,
      documentContext: body.documentContext,
      orgId: user.orgId,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }

  /**
   * POST /ai/generate/template
   * Generates a structured template definition from a description.
   */
  @Post('generate/template')
  generateTemplate(@Body() body: GenerateTemplateDto, @CurrentUser() user: JwtPayload) {
    return this.aiService.generateTemplate({
      description: body.description,
      sampleContent: body.sampleContent,
      orgId: user.orgId,
    });
  }

  /**
   * POST /ai/validate/:documentId
   * Validates document content using AI and returns structured feedback.
   */
  @Post('validate/:documentId')
  @HttpCode(HttpStatus.OK)
  validateDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() body: ValidateDocumentDto,
  ) {
    return this.aiService.validateDocument(documentId, body.content ?? {});
  }
}
