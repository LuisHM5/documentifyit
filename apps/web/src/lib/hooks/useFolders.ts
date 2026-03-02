import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersService, type CreateFolderRequest } from '@/lib/api/services/folders.service';

export const FOLDERS_KEY = ['folders'] as const;

export function useFolders() {
  return useQuery({
    queryKey: FOLDERS_KEY,
    queryFn: () => foldersService.findAll(),
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFolderRequest) => foldersService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FOLDERS_KEY });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FOLDERS_KEY });
    },
  });
}
