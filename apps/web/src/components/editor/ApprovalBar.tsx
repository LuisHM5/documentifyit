'use client';

import { useState } from 'react';
import { useTransitionDocument } from '@/lib/hooks/useDocuments';
import { DocumentStatus } from '@documentifyit/shared';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<DocumentStatus, string> = {
  [DocumentStatus.Draft]: 'Draft',
  [DocumentStatus.Submitted]: 'Submitted',
  [DocumentStatus.InReview]: 'In Review',
  [DocumentStatus.Approved]: 'Approved',
  [DocumentStatus.Rejected]: 'Rejected',
  [DocumentStatus.RevisionRequested]: 'Revision Requested',
  [DocumentStatus.Archived]: 'Archived',
};

const STATUS_COLOR: Record<DocumentStatus, string> = {
  [DocumentStatus.Draft]: 'bg-yellow-100 text-yellow-800',
  [DocumentStatus.Submitted]: 'bg-orange-100 text-orange-800',
  [DocumentStatus.InReview]: 'bg-blue-100 text-blue-800',
  [DocumentStatus.Approved]: 'bg-green-100 text-green-800',
  [DocumentStatus.Rejected]: 'bg-red-100 text-red-800',
  [DocumentStatus.RevisionRequested]: 'bg-amber-100 text-amber-800',
  [DocumentStatus.Archived]: 'bg-gray-100 text-gray-600',
};

const NEXT_ACTIONS: Partial<Record<DocumentStatus, { label: string; to: DocumentStatus; needsComment?: boolean }[]>> = {
  [DocumentStatus.Draft]: [{ label: 'Submit for Review', to: DocumentStatus.Submitted }],
  [DocumentStatus.Submitted]: [
    { label: 'Start Review', to: DocumentStatus.InReview },
    { label: 'Revert to Draft', to: DocumentStatus.Draft },
  ],
  [DocumentStatus.InReview]: [
    { label: 'Approve', to: DocumentStatus.Approved },
    { label: 'Reject', to: DocumentStatus.Rejected, needsComment: true },
    { label: 'Request Revision', to: DocumentStatus.RevisionRequested, needsComment: true },
  ],
  [DocumentStatus.RevisionRequested]: [{ label: 'Return to Draft', to: DocumentStatus.Draft }],
  [DocumentStatus.Approved]: [{ label: 'Archive', to: DocumentStatus.Archived }],
  [DocumentStatus.Rejected]: [{ label: 'Return to Draft', to: DocumentStatus.Draft }],
  [DocumentStatus.Archived]: [],
};

interface ApprovalBarProps {
  documentId: string;
  status: DocumentStatus;
}

export function ApprovalBar({ documentId, status }: ApprovalBarProps) {
  const transition = useTransitionDocument(documentId);
  const [commentFor, setCommentFor] = useState<DocumentStatus | null>(null);
  const [comment, setComment] = useState('');

  const actions = NEXT_ACTIONS[status] ?? [];

  const handleAction = async (to: DocumentStatus, needsComment?: boolean) => {
    if (needsComment) {
      setCommentFor(to);
      return;
    }
    await transition.mutateAsync({ status: to });
  };

  const confirmWithComment = async () => {
    if (!commentFor) return;
    await transition.mutateAsync({ status: commentFor, comment });
    setCommentFor(null);
    setComment('');
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
      <span
        className={cn(
          'rounded-full px-3 py-1 text-xs font-medium',
          STATUS_COLOR[status],
        )}
      >
        {STATUS_LABEL[status]}
      </span>

      <div className="flex gap-2">
        {actions.map((action) => (
          <button
            key={action.to}
            onClick={() => void handleAction(action.to, action.needsComment)}
            disabled={transition.isPending}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
              action.to === DocumentStatus.Approved
                ? 'bg-green-600 text-white hover:bg-green-700'
                : action.to === DocumentStatus.Rejected
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-border hover:bg-muted',
            )}
          >
            {transition.isPending ? '…' : action.label}
          </button>
        ))}
      </div>

      {/* Comment modal for reject/revision */}
      {commentFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h3 className="mb-3 font-semibold">
              {commentFor === DocumentStatus.Rejected ? 'Reject Document' : 'Request Revision'}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Please provide a comment explaining the decision.
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Add your comments here…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setCommentFor(null); setComment(''); }}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmWithComment()}
                disabled={!comment.trim() || transition.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
