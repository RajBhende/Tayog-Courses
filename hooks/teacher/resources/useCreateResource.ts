import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { UploadResourceFormValues } from '@/validation';
import type { Resource } from './useResources';

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadResourceFormValues & { file?: File }): Promise<Resource> => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('type', data.type);
      if (data.file) {
        formData.append('file', data.file);
      }

      const response = await api.post<Resource>('/teacher/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

