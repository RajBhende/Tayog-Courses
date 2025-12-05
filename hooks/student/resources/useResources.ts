import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface StudentResource {
  id: string;
  title: string;
  type: 'PDF_DOCUMENT' | 'VIDEO_CLASS' | 'IMAGE';
  attachment: string;
  createdAt: string;
}

export function useResources() {
  return useQuery({
    queryKey: ['student', 'resources'],
    queryFn: async (): Promise<StudentResource[]> => {
      const response = await api.get<StudentResource[]>('/student/resources');
      return response.data;
    },
  });
}

