import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import type { CreateAssignmentFormValues } from "@/validation/assignments";
import type { Assignment } from "@/types";

interface UpdateAssignmentParams {
  assignmentId: string;
  data: CreateAssignmentFormValues & { attachment?: string | null };
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const { selectedCourseId } = useCourseStore();

  return useMutation({
    mutationFn: async ({ assignmentId, data }: UpdateAssignmentParams): Promise<Assignment> => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const response = await api.put<Assignment>(
        `/teacher/assignments/${assignmentId}?courseId=${selectedCourseId}`,
        {
          ...data,
          courseId: selectedCourseId,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignments", selectedCourseId] });
    },
  });
}
