import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

export interface GenerateDocumentOptions {
  prompt: string;
  templateId?: string;
  orgId: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistDocumentOptions {
  messages: ChatMessage[];
  documentContext?: string;
  orgId: string;
}

export interface GenerateTemplateOptions {
  description: string;
  sampleContent?: string;
  orgId: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  private getOpenAI() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured. Add it to your .env file.',
      );
    }
    return createOpenAI({ apiKey });
  }

  /**
   * Streams a generated document in plain Markdown text.
   * Returns a streamText result — the controller pipes it to the HTTP response.
   */
  streamGenerateDocument(opts: GenerateDocumentOptions) {
    this.logger.log(`AI generate document — org=${opts.orgId}`);
    const openai = this.getOpenAI();

    return streamText({
      model: openai('gpt-4o-mini'),
      system: `You are an expert document writer for a professional document management platform.
Generate well-structured, professional documents in Markdown format.
Use headings, bullet points, and tables where appropriate.
Do not add a preamble; output only the document content.`,
      prompt: opts.prompt,
      maxTokens: 2048,
    });
  }

  /**
   * Streams an AI assistant response for the inline document editor chat.
   */
  streamAssistDocument(opts: AssistDocumentOptions) {
    this.logger.log(`AI assist document — org=${opts.orgId}`);
    const openai = this.getOpenAI();

    const systemPrompt = opts.documentContext
      ? `You are an AI writing assistant embedded in a document editor.
You help users improve, expand, summarize, or rewrite sections of their document.
Respond concisely and directly. Format your response in Markdown.

Current document context:
---
${opts.documentContext.slice(0, 3000)}
---`
      : `You are an AI writing assistant embedded in a document editor.
Help users write, improve, and structure their documents.
Respond concisely and directly. Format your response in Markdown.`;

    return streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      maxTokens: 1024,
    });
  }

  /**
   * Generates a template structure from a description (returns JSON).
   */
  async generateTemplate(opts: GenerateTemplateOptions): Promise<Record<string, unknown>> {
    this.logger.log(`AI generate template — org=${opts.orgId}`);
    const openai = this.getOpenAI();

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are an expert at creating document templates for enterprise workflows.
Return ONLY valid JSON with this exact shape:
{
  "name": "string",
  "description": "string",
  "variables": [{ "name": "string", "label": "string", "type": "text|number|date|boolean|select", "required": boolean }],
  "content": "string (Markdown template with {{variableName}} placeholders)"
}
Do not wrap in code fences. Output only the JSON object.`,
      prompt: `Create a document template for: ${opts.description}${opts.sampleContent ? `\n\nSample content:\n${opts.sampleContent}` : ''}`,
      maxTokens: 1500,
    });

    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return { name: 'AI Template', description: opts.description, variables: [], content: text };
    }
  }

  /**
   * Validates a document against quality standards using AI.
   */
  async validateDocument(
    documentId: string,
    content: Record<string, unknown>,
  ): Promise<{ valid: boolean; issues: string[] }> {
    this.logger.log(`AI validate document ${documentId}`);
    const openai = this.getOpenAI();

    const plainText = this.extractPlainText(content);
    if (!plainText.trim()) {
      return { valid: false, issues: ['Document is empty.'] };
    }

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: `You are a document quality validator. Review the document and identify any issues.
Return ONLY valid JSON: { "valid": boolean, "issues": string[] }
Issues should be specific, actionable strings. Empty array if valid.`,
      prompt: `Validate this document content:\n\n${plainText.slice(0, 3000)}`,
      maxTokens: 512,
    });

    try {
      return JSON.parse(text) as { valid: boolean; issues: string[] };
    } catch {
      return { valid: true, issues: [] };
    }
  }

  extractPlainText(content: Record<string, unknown>): string {
    try {
      const blocks = content['content'] as Array<Record<string, unknown>> | undefined;
      if (!blocks) return '';
      return blocks
        .map((block) => {
          const inline = block['content'] as Array<Record<string, unknown>> | undefined;
          return inline ? inline.map((i) => i['text'] ?? '').join('') : '';
        })
        .join('\n');
    } catch {
      return '';
    }
  }
}
