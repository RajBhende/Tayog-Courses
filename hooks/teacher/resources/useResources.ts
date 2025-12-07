import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import type { Resource } from "@/types";

export function useResources() {
  const { selectedCourseId } = useCourseStore();

  return useQuery({
    queryKey: ["teacher", "resources", selectedCourseId],
    queryFn: async (): Promise<Resource[]> => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const response = await api.get<Resource[]>(
        `/teacher/resources?courseId=${selectedCourseId}`
      );
      return response.data;
    },
    enabled: !!selectedCourseId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
