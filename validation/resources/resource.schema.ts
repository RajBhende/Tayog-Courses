import * as z from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES: Record<string, string[]> = {
  "Note / PDF": [".pdf", ".doc", ".docx"],
  "Video Class": [".mp4", ".mov", ".avi", ".webm"],
  Image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
};

export const uploadResourceSchema = z
  .object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters.")
      .max(200, "Title must be at most 200 characters.")
      .trim(),
    type: z.enum(["Note / PDF", "Video Class", "Image"], {
      required_error: "Resource type is required.",
    }),
    file: z
      .instanceof(File, { message: "File is required." })
      .optional()
      .refine(
        (file) => {
          if (!file) return true; // Optional for update cases
          return file.size <= MAX_FILE_SIZE;
        },
        {
          message: "File size must be less than 10MB.",
        }
      )
      .refine(
        (file) => {
          if (!file) return true;
          const extension = "." + file.name.split(".").pop()?.toLowerCase();
          // This will be validated based on type in refine
          return true;
        },
        {
          message: "Invalid file type.",
        }
      ),
  })
  .refine(
    (data) => {
      if (!data.file) return true;
      const extension = "." + data.file.name.split(".").pop()?.toLowerCase();
      const acceptedTypes = ACCEPTED_FILE_TYPES[data.type] || [];
      return acceptedTypes.includes(extension);
    },
    {
      message:
        "File type does not match the selected resource type. Please select a valid file.",
      path: ["file"],
    }
  );

export type UploadResourceFormValues = z.infer<typeof uploadResourceSchema>;

export interface UploadResourceFormData extends UploadResourceFormValues {}

export interface ResourceDetails extends Omit<UploadResourceFormValues, "file"> {
  id: string;
  attachment: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

