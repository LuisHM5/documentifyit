'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/lib/hooks/useDocuments';
import { GenerateDocumentModal } from '@/components/documents/GenerateDocumentModal';
import type { Document } from '@documentifyit/shared';
import { DocumentStatus } from '@documentifyit/shared';

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function statusBadge(status: DocumentStatus) {
  const map: Record<DocumentStatus, string> = {
    [DocumentStatus.Draft]: 'bg-yellow-100 text-yellow-800',
    [DocumentStatus.Submitted]: 'bg-orange-100 text-orange-800',
    [DocumentStatus.InReview]: 'bg-blue-100 text-blue-800',
    [DocumentStatus.Approved]: 'bg-green-100 text-green-800',
    [DocumentStatus.Rejected]: 'bg-red-100 text-red-800',
    [DocumentStatus.RevisionRequested]: 'bg-amber-100 text-amber-800',
    [DocumentStatus.Archived]: 'bg-gray-100 text-gray-600',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export default function DocumentsPage() {
  const router = useRouter();
  const { data: documents, isLoading, error } = useDocuments();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const doc = await createDocument.mutateAsync({ title: newTitle.trim() });
    setCreating(false);
    setNewTitle('');
    router.push(`/documents/${doc.id}`);
  };

  const handleGeneratedDoc = async (title: string, markdownContent: string) => {
    // Convert markdown to a basic BlockNote content structure
    const content = {
      type: 'doc',
      content: markdownContent
        .split('\n\n')
        .filter(Boolean)
        .map((paragraph) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: paragraph }],
        })),
    };
    const doc = await createDocument.mutateAsync({ title, content });
    router.push(`/documents/${doc.id}`);
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    setDeletingId(doc.id);
    try {
      await deleteDocument.mutateAsync(doc.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setGenerating(true)}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            ✨ Generate with AI
          </button>
          <button
            onClick={() => setCreating(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            New document
          </button>
        </div>
      </div>

      {generating && (
        <GenerateDocumentModal
          onClose={() => setGenerating(false)}
          onGenerated={(title, md) => void handleGeneratedDoc(title, md)}
        />
      )}

      {/* New document modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">New document</h2>
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label htmlFor="doc-title" className="mb-1 block text-sm font-medium">
                  Title
                </label>
                <input
                  id="doc-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Untitled document"
                  autoFocus
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewTitle('');
                  }}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDocument.isPending || !newTitle.trim()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createDocument.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load documents. Please refresh the page.
        </div>
      )}

      {!isLoading && !error && documents && documents.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No documents yet. Create your first document.</p>
        </div>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
            >
              <button
                className="flex-1 text-left"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                <p className="text-sm font-medium text-foreground">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(doc.updatedAt)}
                </p>
              </button>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(doc.status)}`}
                >
                  {doc.status.replace('_', ' ')}
                </span>
                <button
                  onClick={() => void handleDelete(doc)}
                  disabled={deletingId === doc.id}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label="Delete document"
                >
                  {deletingId === doc.id ? '...' : '×'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
