import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";

export function useDeleteResource() {
  const queryClient = useQueryClient();
  const { selectedCourseId } = useCourseStore();

  return useMutation({
    mutationFn: async (resourceId: string): Promise<void> => {
      await api.delete(`/teacher/resources/${resourceId}`);
    },
    onSuccess: () => {
      // Invalidate resources query to refetch the list
      queryClient.invalidateQueries({
        queryKey: ["teacher", "resources", selectedCourseId],
      });
    },
  });
}

