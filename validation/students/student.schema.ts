import * as z from "zod";

export const enrollStudentSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name must be at most 100 characters.")
    .refine(
      (val) => {
        if (!val) return false;
        const trimmed = val.trim();
        return trimmed.split(/\s+/).length >= 2 || trimmed.length >= 2;
      },
      {
        message: "Please enter full name (first and last name).",
      }
    ),
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address.")
    .toLowerCase()
    .refine(
      (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val);
      },
      {
        message: "Please enter a valid email address format.",
      }
    ),
});

export type EnrollStudentFormValues = z.infer<typeof enrollStudentSchema>;

export interface EnrollStudentFormData extends EnrollStudentFormValues {}

export interface StudentDetails extends EnrollStudentFormValues {
  id: string;
  studentId: string;
  initials: string;
}

