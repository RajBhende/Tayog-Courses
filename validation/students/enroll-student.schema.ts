import * as z from "zod";

export const enrollStudentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name must be at most 100 characters."),
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
});

export type EnrollStudentFormValues = z.infer<typeof enrollStudentSchema>;

