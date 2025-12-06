import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import type { EnrollStudentFormValues } from "@/validation/students";
import type { Student } from "@/types";

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  const { selectedCourseId } = useCourseStore();

  return useMutation({
    mutationFn: async (data: EnrollStudentFormValues): Promise<Student> => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const response = await api.post<Student>("/teacher/students", {
        ...data,
        courseId: selectedCourseId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher", "students", selectedCourseId],
      });
    },
  });
}
