import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachment?: string | null;
  status: 'pending' | 'submitted' | 'graded';
  submission?: string | null;
  submittedFile?: string | null;
  feedback?: string | null;
  grade?: string | null;
}

export function useAssignments() {
  return useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: async (): Promise<StudentAssignment[]> => {
      const response = await api.get<StudentAssignment[]>('/student/assignments');
      return response.data;
    },
  });
}

