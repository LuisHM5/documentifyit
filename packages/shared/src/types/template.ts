export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  /** JSONB — same format as Document.content */
  content: Record<string, unknown>;
  variables: TemplateVariable[];
  /** true if created by AI generation */
  isAI: boolean;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}
