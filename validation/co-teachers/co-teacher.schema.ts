import { z } from "zod";

export const inviteCoTeacherSchema = z.object({
  email: z.string().email("Invalid email address"),
  courseId: z.string().min(1, "Course ID is required"),
});

export type InviteCoTeacherFormValues = z.infer<typeof inviteCoTeacherSchema>;

