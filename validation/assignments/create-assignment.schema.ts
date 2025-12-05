import * as z from "zod";

export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title must be at most 100 characters."),
  dueDate: z.string().min(1, "Due date is required."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(500, "Description must be at most 500 characters."),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;

