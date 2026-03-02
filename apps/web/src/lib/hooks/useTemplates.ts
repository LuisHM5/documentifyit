import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesService, type CreateTemplateRequest } from '@/lib/api/services/templates.service';

export const TEMPLATES_KEY = ['templates'] as const;
export const templateKey = (id: string) => ['templates', id] as const;

export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: () => templatesService.findAll(),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKey(id),
    queryFn: () => templatesService.findById(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => templatesService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: templateKey(id) });
      void queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });
}
