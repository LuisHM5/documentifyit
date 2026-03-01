import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate/document')
  generateDocument(@Body() body: { prompt: string; templateId?: string }) {
    return this.aiService.generateDocument({
      ...body,
      orgId: 'org-placeholder',
    });
  }

  @Post('generate/template')
  generateTemplate(@Body() body: { description: string; sampleContent?: string }) {
    return this.aiService.generateTemplate({
      ...body,
      orgId: 'org-placeholder',
    });
  }

  @Post('validate/:documentId')
  validateDocument(
    @Body() body: { documentId: string; content: Record<string, unknown> },
  ) {
    return this.aiService.validateDocument(body.documentId, body.content);
  }
}
