import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface SubmitFeedbackParams {
  submissionId: string;
  comment: string;
  grade?: number;
}

interface FeedbackResponse {
  success: boolean;
  feedback: {
    id: string;
    comment: string;
    grade: number | null;
  };
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      comment,
      grade,
    }: SubmitFeedbackParams): Promise<FeedbackResponse> => {
      const response = await api.post<FeedbackResponse>(
        `/teacher/assignments/submissions/${submissionId}/feedback`,
        {
          comment,
          grade,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate assignment queries to refetch updated feedback
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignments"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignment"] });
    },
  });
}
