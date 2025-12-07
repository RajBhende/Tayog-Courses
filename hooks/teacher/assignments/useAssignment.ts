import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Assignment } from "@/types/assignment";

export function useAssignment(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ["teacher", "assignment", assignmentId],
    queryFn: async (): Promise<Assignment> => {
      if (!assignmentId) {
        throw new Error("Assignment ID is required");
      }
      const response = await api.get<Assignment>(
        `/teacher/assignments/${assignmentId}`
      );
      return response.data;
    },
    enabled: !!assignmentId,
  });
}
