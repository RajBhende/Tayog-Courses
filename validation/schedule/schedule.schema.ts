import * as z from "zod";

export const scheduleClassSchema = z
  .object({
    subject: z
      .string()
      .min(2, "Subject must be at least 2 characters.")
      .max(100, "Subject must be at most 100 characters.")
      .trim(),
    time: z
      .string()
      .min(1, "Time is required.")
      .refine(
        (val) => {
          if (!val) return false;
          // Format: "YYYY-MM-DD HH:MM"
          const timeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
          if (!timeRegex.test(val)) return false;
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        {
          message: "Please enter a valid date and time format (YYYY-MM-DD HH:MM).",
        }
      ),
    topic: z
      .string()
      .min(2, "Topic must be at least 2 characters.")
      .max(200, "Topic must be at most 200 characters.")
      .trim(),
    meetingLink: z
      .string()
      .min(1, "Meeting link is required.")
      .trim()
      .refine(
        (val) => {
          if (!val) return false;

          const trimmedUrl = val.trim().toLowerCase();

          // Only allow HTTPS URLs for security
          if (!trimmedUrl.startsWith("https://")) {
            return false;
          }

          // Validate it's a proper URL
          try {
            const url = new URL(trimmedUrl);
            // Ensure it's HTTPS protocol
            return url.protocol === "https:";
          } catch {
            return false;
          }
        },
        {
          message:
            "Only secure HTTPS links are allowed. Please enter a valid HTTPS URL (e.g., https://meet.google.com/xyz-abc-def).",
        }
      ),
  })
  .refine(
    (data) => {
      if (!data.time) return true;
      const scheduleDate = new Date(data.time);
      const now = new Date();
      return scheduleDate >= now;
    },
    {
      message: "Scheduled time must be in the future.",
      path: ["time"],
    }
  );

export type ScheduleClassFormValues = z.infer<typeof scheduleClassSchema>;

export interface ScheduleClassFormData extends ScheduleClassFormValues {}

export interface ScheduleDetails extends ScheduleClassFormValues {
  id: string;
  courseId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

