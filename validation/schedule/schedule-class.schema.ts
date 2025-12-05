import * as z from "zod";

export const scheduleClassSchema = z.object({
  subject: z
    .string()
    .min(2, "Subject must be at least 2 characters.")
    .max(100, "Subject must be at most 100 characters."),
  time: z.string().min(1, "Time is required."),
  topic: z
    .string()
    .min(2, "Topic must be at least 2 characters.")
    .max(200, "Topic must be at most 200 characters."),
  meetingLink: z
    .string()
    .min(1, "Meeting link is required.")
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
});

export type ScheduleClassFormValues = z.infer<typeof scheduleClassSchema>;

