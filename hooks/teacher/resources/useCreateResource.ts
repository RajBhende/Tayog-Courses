import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import type { UploadResourceFormValues } from "@/validation/resources";
import type { Resource } from "@/types";

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { selectedCourseId } = useCourseStore();

  return useMutation({
    mutationFn: async (
      data: UploadResourceFormValues & { file?: File }
    ): Promise<Resource> => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("type", data.type);
      formData.append("courseId", selectedCourseId);
      if (data.file) {
        formData.append("file", data.file);
      }

      const response = await api.post<Resource>(
        "/teacher/resources",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch resources immediately
      queryClient.invalidateQueries({
        queryKey: ["teacher", "resources", selectedCourseId],
      });
    },
  });
}
