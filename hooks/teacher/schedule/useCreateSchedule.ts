import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import type { ScheduleClassFormValues } from "@/validation/schedule";
import type { ScheduleResponse } from "@/types/schedule";

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { selectedCourseId } = useCourseStore();

  return useMutation({
    mutationFn: async (data: ScheduleClassFormValues): Promise<ScheduleResponse> => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const response = await api.post<ScheduleResponse>("/teacher/schedule", {
        ...data,
        courseId: selectedCourseId,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create schedule");
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher", "schedules", selectedCourseId],
      });
    },
  });
}
