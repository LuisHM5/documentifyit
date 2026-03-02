'use client';

import { useState } from 'react';
import { streamGenerateDocument } from '@/lib/api/services/ai.service';

interface GenerateDocumentModalProps {
  onClose: () => void;
  onGenerated: (title: string, markdownContent: string) => void;
}

export function GenerateDocumentModal({ onClose, onGenerated }: GenerateDocumentModalProps) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setStreaming(true);
    setPreview('');
    setDone(false);
    setError('');

    try {
      let full = '';
      for await (const chunk of streamGenerateDocument(prompt)) {
        full += chunk;
        setPreview(full);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setStreaming(false);
    }
  };

  const handleUse = () => {
    onGenerated(title || 'AI Generated Document', preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-2xl flex-col rounded-lg bg-card shadow-lg" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Generate Document with AI</h2>
            <p className="text-sm text-muted-foreground">
              Describe what you want and AI will write it for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Document title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Marketing Strategy"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Describe the document</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. Write a comprehensive project plan for building a mobile app, including timeline, resources, and risk management sections."
              disabled={streaming}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          {(preview || streaming) && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium">Generated content</label>
                {streaming && (
                  <span className="text-xs text-muted-foreground animate-pulse">Generating…</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{preview}</pre>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          {!done ? (
            <button
              onClick={() => void handleGenerate()}
              disabled={streaming || !prompt.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {streaming ? 'Generating…' : 'Generate'}
            </button>
          ) : (
            <button
              onClick={handleUse}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Use this document
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
