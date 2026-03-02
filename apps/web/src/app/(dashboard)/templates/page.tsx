'use client';

import { useState } from 'react';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/lib/hooks/useTemplates';

function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TemplatesPage() {
  const { data: templates, isLoading, error } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createTemplate.mutateAsync({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
    });
    setCreating(false);
    setNewName('');
    setNewDescription('');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteTemplate.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          New template
        </button>
      </div>

      {/* New template modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">New template</h2>
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label htmlFor="tmpl-name" className="mb-1 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="tmpl-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Meeting Notes"
                  autoFocus
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="tmpl-desc" className="mb-1 block text-sm font-medium">
                  Description (optional)
                </label>
                <input
                  id="tmpl-desc"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A brief description..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName('');
                    setNewDescription('');
                  }}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplate.isPending || !newName.trim()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createTemplate.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load templates. Please refresh the page.
        </div>
      )}

      {!isLoading && !error && templates && templates.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No templates yet. Create your first template.</p>
        </div>
      )}

      {!isLoading && templates && templates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-tight">{tmpl.name}</h3>
                  {tmpl.isAI && (
                    <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                      AI
                    </span>
                  )}
                </div>
                {tmpl.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {tmpl.description}
                  </p>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDate(tmpl.createdAt)}
                </span>
                <button
                  onClick={() => void handleDelete(tmpl.id, tmpl.name)}
                  disabled={deletingId === tmpl.id}
                  className="rounded p-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  {deletingId === tmpl.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
