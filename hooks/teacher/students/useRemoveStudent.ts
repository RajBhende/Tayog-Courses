import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useRemoveStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string): Promise<void> => {
      await api.delete(`/teacher/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

