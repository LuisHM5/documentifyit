import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService, type CreateDocumentRequest, type UpdateDocumentRequest } from '@/lib/api/services/documents.service';
import type { DocumentStatus } from '@documentifyit/shared';

export const DOCUMENTS_KEY = ['documents'] as const;
export const documentKey = (id: string) => ['documents', id] as const;

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: () => documentsService.findAll(),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => documentsService.findById(id),
    enabled: !!id,
    // Keep cached content fresh for 30 s so a navigation back to the same
    // document does not flash empty content while the background refetch runs.
    staleTime: 30_000,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentRequest) => documentsService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDocumentRequest) => documentsService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentKey(id), updated);
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: documentKey(id) });
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}

export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId, 'versions'],
    queryFn: () => documentsService.getVersions(documentId),
    enabled: !!documentId,
  });
}

export function useRestoreVersion(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionNumber: number) =>
      documentsService.restoreVersion(documentId, versionNumber),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentKey(documentId), updated);
      void queryClient.invalidateQueries({ queryKey: ['documents', documentId, 'versions'] });
    },
  });
}

export function useTransitionDocument(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ status, comment }: { status: DocumentStatus; comment?: string }) =>
      documentsService.transition(documentId, status, comment),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentKey(documentId), updated);
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}
