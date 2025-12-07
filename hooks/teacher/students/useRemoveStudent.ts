import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useCourseStore } from '@/lib/courseStore';

export function useRemoveStudent() {
  const queryClient = useQueryClient();
  const { selectedCourseId } = useCourseStore();

  return useMutation({
    mutationFn: async (studentId: string): Promise<void> => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      await api.delete(`/teacher/students/${studentId}?courseId=${selectedCourseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

