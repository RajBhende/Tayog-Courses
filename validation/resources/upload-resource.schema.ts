import * as z from "zod";

export const uploadResourceSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters.")
    .max(200, "Title must be at most 200 characters."),
  type: z.enum(["Note / PDF", "Video Class", "Image"]),
  file: z.instanceof(File).optional(),
});

export type UploadResourceFormValues = z.infer<typeof uploadResourceSchema>;

