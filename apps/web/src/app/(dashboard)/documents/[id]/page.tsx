import { Editor } from '@/components/editor/Editor';

interface DocumentPageProps {
  params: { id: string };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document</h1>
        <span className="text-sm text-muted-foreground">ID: {params.id}</span>
      </div>
      <Editor />
    </div>
  );
}
