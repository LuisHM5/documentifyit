'use client';

import { useDocumentVersions, useRestoreVersion } from '@/lib/hooks/useDocuments';

interface VersionHistoryPanelProps {
  documentId: string;
  currentVersion: number;
  onClose: () => void;
}

export function VersionHistoryPanel({
  documentId,
  currentVersion,
  onClose,
}: VersionHistoryPanelProps) {
  const { data: versions, isLoading } = useDocumentVersions(documentId);
  const restoreVersion = useRestoreVersion(documentId);

  const handleRestore = async (versionNumber: number) => {
    if (!confirm(`Restore version ${versionNumber}? This will create a new version with that content.`)) return;
    await restoreVersion.mutateAsync(versionNumber);
    onClose();
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Version History</h3>
          <p className="text-xs text-muted-foreground">Current: v{currentVersion}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close version history"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="p-4 text-center text-sm text-muted-foreground">Loading versions…</p>
        )}
        {!isLoading && (!versions || versions.length === 0) && (
          <p className="p-4 text-center text-sm text-muted-foreground">No versions saved yet.</p>
        )}
        {versions?.map((v) => (
          <div
            key={v.id}
            className="mb-1 flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
          >
            <div>
              <span className="text-sm font-medium">
                v{v.versionNumber}
                {v.versionNumber === currentVersion && (
                  <span className="ml-2 text-xs text-muted-foreground">(current)</span>
                )}
              </span>
              <p className="text-xs text-muted-foreground">
                {new Date(v.createdAt).toLocaleString()}
              </p>
            </div>
            {v.versionNumber !== currentVersion && (
              <button
                onClick={() => void handleRestore(v.versionNumber)}
                disabled={restoreVersion.isPending}
                className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                Restore
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
