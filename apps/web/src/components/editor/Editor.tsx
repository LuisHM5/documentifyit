'use client';

import '@blocknote/core/fonts/inter.css';
import type { BlockNoteEditorOptions, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote, useEditorChange } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

import { apiClient } from '@/lib/api/client';

type AnySchema = BlockNoteEditorOptions<any, any, any>;
type AnyBlock = PartialBlock<AnySchema['schema'] extends { blockSchema: infer B } ? B : any, any, any>;

/**
 * Validate that a value from the DB is a non-empty array of BlockNote block
 * objects (each must have at least a `type` string property).  Rejects plain
 * arrays-of-arrays like [[],[]] that can end up in the DB from corrupted saves.
 */
function isValidBlockArray(value: unknown): value is AnyBlock[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        typeof (item as Record<string, unknown>)['type'] === 'string',
    )
  );
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post<{ url: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const { url } = res.data;
  if (url.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${url}`;
  }
  return url;
}

interface EditorProps {
  initialContent?: AnyBlock[];
  onChange?: (content: unknown) => void;
  editable?: boolean;
}

export function Editor({ initialContent, onChange, editable = true }: EditorProps) {
  // Only pass initialContent if it is a valid non-empty array of block objects.
  // An empty array [] or a corrupted array like [[],[]] both produce undefined
  // so BlockNote falls back to a default empty paragraph.
  const safeInitialContent = isValidBlockArray(initialContent) ? initialContent : undefined;

  const editor = useCreateBlockNote({ initialContent: safeInitialContent, uploadFile });

  // useEditorChange is the canonical BlockNote hook for subscribing to editor
  // changes. The editor instance comes from useCreateBlockNote (stable useMemo
  // reference) so accessing editor.document here is always current.
  useEditorChange(() => {
    if (onChange) {
      onChange(editor.document);
    }
  }, editor);

  return (
    <div className="min-h-[500px] rounded-lg border border-border bg-card">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme="light"
      />
    </div>
  );
}
