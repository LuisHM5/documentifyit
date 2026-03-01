import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GenerateDocumentDto {
  prompt: string;
  templateId?: string;
  orgId: string;
}

export interface GenerateTemplateDto {
  description: string;
  sampleContent?: string;
  orgId: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateDocument(dto: GenerateDocumentDto): Promise<Record<string, unknown>> {
    this.logger.debug(`Generating document for org ${dto.orgId}: ${dto.prompt}`);
    // TODO: implement with Vercel AI SDK
    // const { text } = await generateText({ model: openai('gpt-4o'), prompt: dto.prompt });
    return { type: 'doc', content: [] };
  }

  async generateTemplate(dto: GenerateTemplateDto): Promise<Record<string, unknown>> {
    this.logger.debug(`Generating template for org ${dto.orgId}: ${dto.description}`);
    // TODO: implement with Vercel AI SDK
    return { name: 'AI Template', variables: [], content: { type: 'doc', content: [] } };
  }

  async validateDocument(
    documentId: string,
    content: Record<string, unknown>,
  ): Promise<{ valid: boolean; issues: string[] }> {
    this.logger.debug(`Validating document ${documentId}`);
    // TODO: implement AI validation
    return { valid: true, issues: [] };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // TODO: implement with Vercel AI SDK embed()
    return [];
  }
}
