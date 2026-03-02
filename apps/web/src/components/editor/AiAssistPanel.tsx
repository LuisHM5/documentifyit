'use client';

import { useState, useRef } from 'react';
import { streamAssistDocument, type ChatMessage } from '@/lib/api/services/ai.service';
import { cn } from '@/lib/utils';

interface AiAssistPanelProps {
  documentContext?: string;
  onClose: () => void;
}

export function AiAssistPanel({ documentContext, onClose }: AiAssistPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setIsStreaming(true);
    abortRef.current = false;

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const stream = streamAssistDocument(newMessages, documentContext);
      for await (const chunk of stream) {
        if (abortRef.current) break;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI request failed');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask me to improve or expand your document</p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close AI panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try asking:</p>
            {[
              'Summarize this document in 3 bullet points',
              'Make this more formal and professional',
              'Add an executive summary section',
              'Identify any gaps or missing information',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="block w-full rounded-md border border-border px-3 py-2 text-left text-xs hover:bg-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'ml-6 bg-primary text-primary-foreground'
                : 'mr-6 bg-muted text-foreground',
            )}
          >
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
          </div>
        ))}

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask the AI assistant…"
            rows={2}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={isStreaming || !input.trim()}
            className="self-end rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isStreaming ? '…' : 'Send'}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Shift+Enter for new line</p>
      </div>
    </div>
  );
}
