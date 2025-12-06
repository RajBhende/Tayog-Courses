import * as z from "zod";

const baseSignupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(255, "Name must be at most 255 characters.")
    .trim()
    .refine(
      (val) => {
        const trimmed = val.trim();
        return trimmed.length >= 2 && trimmed.split(/\s+/).length >= 1;
      },
      {
        message: "Please enter a valid full name.",
      }
    ),
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address.")
    .toLowerCase()
    .trim()
    .max(255, "Email must be at most 255 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number."
    )
    .refine(
      (val) => {
        // Additional check: no spaces
        return !val.includes(" ");
      },
      {
        message: "Password cannot contain spaces.",
      }
    ),
  role: z.enum(["TEACHER", "STUDENT"], {
    message: "Role is required. Please select TEACHER or STUDENT.",
  }),
});

export const signupSchema = baseSignupSchema
  .extend({
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password.")
      .refine((val) => !val.includes(" "), {
        message: "Password cannot contain spaces.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const signupApiSchema = baseSignupSchema;

export type SignupFormValues = z.infer<typeof signupSchema>;
export type SignupApiValues = z.infer<typeof signupApiSchema>;

export interface SignupFormData extends SignupFormValues {}

export interface SignupApiData extends SignupApiValues {}

