import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ScheduleClassFormValues } from '@/validation';
import type { Schedule } from './useSchedules';

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ScheduleClassFormValues): Promise<Schedule> => {
      const response = await api.post<Schedule>('/teacher/schedule', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
}

