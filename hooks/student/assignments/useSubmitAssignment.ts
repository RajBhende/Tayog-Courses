import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface SubmitAssignmentData {
  assignmentId: string;
  summary?: string;
  fileUrl?: string;
}

interface SubmitAssignmentResponse {
  success: boolean;
  id: string;
  summary: string;
  fileUrl?: string | null;
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitAssignmentData): Promise<SubmitAssignmentResponse> => {
      const response = await api.post<SubmitAssignmentResponse>('/student/assignments/submit', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'assignments'] });
    },
  });
}

