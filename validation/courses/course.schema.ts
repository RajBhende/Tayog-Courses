import * as z from "zod";

export const createCourseSchema = z.object({
  name: z
    .string()
    .min(3, "Course name must be at least 3 characters.")
    .max(100, "Course name must be at most 100 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description must be at most 500 characters.")
    .optional(),
  thumbnail: z
    .string()
    .url("Thumbnail must be a valid URL.")
    .optional()
    .or(z.literal("")),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;
