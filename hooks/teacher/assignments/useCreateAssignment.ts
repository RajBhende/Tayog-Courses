import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { CreateAssignmentFormValues } from '@/validation';
import type { Assignment } from './useAssignments';

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAssignmentFormValues & { attachment?: string }): Promise<Assignment> => {
      const response = await api.post<Assignment>('/teacher/assignments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}

