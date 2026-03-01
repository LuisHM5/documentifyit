'use client';

import '@blocknote/core/fonts/inter.css';
import type { BlockNoteEditorOptions, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

type AnySchema = BlockNoteEditorOptions<any, any, any>;

interface EditorProps {
  initialContent?: PartialBlock<AnySchema['schema'] extends { blockSchema: infer B } ? B : any, any, any>[];
  onChange?: (content: unknown) => void;
  editable?: boolean;
}

export function Editor({ initialContent, onChange, editable = true }: EditorProps) {
  const editor = useCreateBlockNote({ initialContent });

  return (
    <div className="min-h-[500px] rounded-lg border border-border bg-card">
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={() => {
          if (onChange) {
            onChange(editor.document);
          }
        }}
        theme="light"
      />
    </div>
  );
}
