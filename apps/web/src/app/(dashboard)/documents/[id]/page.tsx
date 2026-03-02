'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/editor/Editor';
import { AiAssistPanel } from '@/components/editor/AiAssistPanel';
import { VersionHistoryPanel } from '@/components/editor/VersionHistoryPanel';
import { ApprovalBar } from '@/components/editor/ApprovalBar';
import { useDocument, useUpdateDocument } from '@/lib/hooks/useDocuments';
import { useDocumentSocket, type Presence } from '@/lib/hooks/useDocumentSocket';
import { documentsService } from '@/lib/api/services/documents.service';
import { cn } from '@/lib/utils';
import type { PartialBlock } from '@blocknote/core';

interface DocumentPageProps {
  params: { id: string };
}

type SidePanel = 'ai' | 'versions' | null;

const AUTOSAVE_DELAY_MS = 1500;

export default function DocumentPage({ params }: DocumentPageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: document, isLoading, error } = useDocument(id);
  const updateDocument = useUpdateDocument(id);

  const [title, setTitle] = useState('');
  const [titleDirty, setTitleDirty] = useState(false);
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [documentText, setDocumentText] = useState('');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Map<string, string>>(new Map());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time collaboration
  useDocumentSocket({
    documentId: id,
    onPresence: (presence: Presence) => {
      setCollaborators((prev) => {
        const next = new Map(prev);
        if (presence.type === 'join') {
          next.set(presence.userId, presence.name);
        } else {
          next.delete(presence.userId);
        }
        return next;
      });
    },
  });

  useEffect(() => {
    if (document && !titleDirty) {
      setTitle(document.title);
    }
  }, [document, titleDirty]);

  const scheduleSave = useCallback(
    (patch: { title?: string; content?: Record<string, unknown> }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void updateDocument.mutateAsync(patch);
      }, AUTOSAVE_DELAY_MS);
    },
    [updateDocument],
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setTitleDirty(true);
    scheduleSave({ title: value });
  };

  const handleContentChange = (content: unknown) => {
    const contentObj = content as Record<string, unknown>;
    // Extract plain text for AI context
    try {
      const blocks = (contentObj['content'] as Array<Record<string, unknown>>) ?? [];
      const text = blocks
        .map((b) => {
          const inline = b['content'] as Array<Record<string, unknown>> | undefined;
          return inline ? inline.map((i) => i['text'] ?? '').join('') : '';
        })
        .join('\n');
      setDocumentText(text);
    } catch {
      // ignore
    }
    scheduleSave({ content: contentObj });
  };

  const handleCreateShareLink = async () => {
    setSharingLoading(true);
    try {
      const link = await documentsService.createShareLink(id);
      setShareToken(link.token);
    } finally {
      setSharingLoading(false);
    }
  };

  const shareUrl = shareToken
    ? `${window.location.origin}/share/${shareToken}`
    : null;

  const togglePanel = (panel: SidePanel) => {
    setSidePanel((prev) => (prev === panel ? null : panel));
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading document…</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push('/documents')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to documents
        </button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Document not found or you don&apos;t have access.
        </div>
      </div>
    );
  }

  const initialContent = document.content?.content
    ? (document.content.content as PartialBlock[])
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2">
        <button
          onClick={() => router.push('/documents')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ←
        </button>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled document"
          className="flex-1 border-0 bg-transparent text-lg font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
        />
        <div className="flex items-center gap-2">
          {collaborators.size > 0 && (
            <div className="flex items-center gap-1">
              {[...collaborators.values()].map((name) => (
                <span
                  key={name}
                  title={name}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white"
                >
                  {name[0]?.toUpperCase()}
                </span>
              ))}
            </div>
          )}
          {updateDocument.isPending && (
            <span className="text-xs text-muted-foreground">Saving…</span>
          )}
          {updateDocument.isSuccess && !updateDocument.isPending && (
            <span className="text-xs text-green-600">Saved</span>
          )}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            v{document.version}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => togglePanel('ai')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              sidePanel === 'ai' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            ✨ AI
          </button>
          <button
            onClick={() => togglePanel('versions')}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              sidePanel === 'versions' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            History
          </button>
          <button
            onClick={() => void handleCreateShareLink()}
            disabled={sharingLoading}
            className="rounded-md px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            Share
          </button>
        </div>
      </div>

      {/* Share link banner */}
      {shareUrl && (
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-muted/30 px-4 py-2">
          <span className="text-xs text-muted-foreground">Share link:</span>
          <code className="flex-1 rounded bg-muted px-2 py-0.5 text-xs">{shareUrl}</code>
          <button
            onClick={() => void navigator.clipboard.writeText(shareUrl)}
            className="text-xs text-primary hover:underline"
          >
            Copy
          </button>
          <button
            onClick={() => setShareToken(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {/* Approval bar */}
      <div className="shrink-0 px-4 py-2">
        <ApprovalBar documentId={id} status={document.status} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Editor
            key={document.id}
            initialContent={initialContent}
            onChange={handleContentChange}
          />
        </div>

        {sidePanel && (
          <div className="w-80 shrink-0 overflow-hidden">
            {sidePanel === 'ai' && (
              <AiAssistPanel
                documentContext={documentText}
                onClose={() => setSidePanel(null)}
              />
            )}
            {sidePanel === 'versions' && (
              <VersionHistoryPanel
                documentId={id}
                currentVersion={document.version}
                onClose={() => setSidePanel(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
