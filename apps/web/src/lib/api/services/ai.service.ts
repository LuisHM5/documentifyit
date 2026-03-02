import { getAccessToken } from '../token';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Streams an AI-generated document from a prompt.
 * Calls the SSE endpoint and yields text chunks.
 */
export async function* streamGenerateDocument(prompt: string): AsyncGenerator<string> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/ai/generate/document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) throw new Error(`AI generate failed: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data) as { text: string };
          yield parsed.text;
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}

/**
 * Streams an AI assistant response for document editing.
 */
export async function* streamAssistDocument(
  messages: ChatMessage[],
  documentContext?: string,
): AsyncGenerator<string> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/ai/assist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, documentContext }),
  });

  if (!res.ok) throw new Error(`AI assist failed: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data) as { text: string };
          yield parsed.text;
        } catch {
          // skip
        }
      }
    }
  }
}
