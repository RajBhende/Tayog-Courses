import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface StudentSchedule {
  id: string;
  subject: string;
  topic: string;
  time: string;
  meetingLink: string;
}

export function useSchedules() {
  return useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: async (): Promise<StudentSchedule[]> => {
      const response = await api.get<StudentSchedule[]>('/student/schedule');
      return response.data;
    },
  });
}

