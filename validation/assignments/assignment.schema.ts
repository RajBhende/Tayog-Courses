import * as z from "zod";

export const createAssignmentSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters.")
      .max(100, "Title must be at most 100 characters."),
    dueDate: z
      .string()
      .min(1, "Due date is required.")
      .refine(
        (val) => {
          if (!val) return false;
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        {
          message: "Please enter a valid date.",
        }
      ),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters.")
      .max(500, "Description must be at most 500 characters."),
    attachment: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.dueDate) return true;
      const dueDate = new Date(data.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate >= today;
    },
    {
      message: "Due date must be today or in the future.",
      path: ["dueDate"],
    }
  );

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;

export interface CreateAssignmentFormData extends CreateAssignmentFormValues {}

export interface AssignmentDetails extends CreateAssignmentFormValues {
  id: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

