import * as z from "zod";

// Different file size limits for different resource types
const MAX_FILE_SIZES: Record<string, number> = {
  "Note / PDF": 10 * 1024 * 1024, // 10MB for PDFs
  "Video Class": 200 * 1024 * 1024, // 200MB for Videos
  Image: 10 * 1024 * 1024, // 10MB for Images
};

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
    type: z.enum(["Note / PDF", "Video Class", "Image"]),
    file: z.instanceof(File, { message: "File is required." }).optional(),
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
  )
  .superRefine((data, ctx) => {
    if (!data.file) return;
    
    const maxSize = MAX_FILE_SIZES[data.type] || MAX_FILE_SIZES["Note / PDF"];
    const maxSizeMB = maxSize / (1024 * 1024);
    
    if (data.file.size > maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `File size must be less than ${maxSizeMB}MB.`,
        path: ["file"],
      });
    }
  });

export type UploadResourceFormValues = z.infer<typeof uploadResourceSchema>;

export interface UploadResourceFormData extends UploadResourceFormValues {}

export interface ResourceDetails extends Omit<UploadResourceFormValues, "file"> {
  id: string;
  attachment: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

