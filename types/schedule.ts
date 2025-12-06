export interface Schedule {
  id: string;
  subject: string;
  topic: string;
  time: string;
  meetingLink: string;
  courseId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  subject: string;
  topic: string;
  time: string;
  meetingLink: string;
}

export interface ScheduleResponse {
  success: boolean;
  id: string;
  subject: string;
  topic: string;
  time: string;
  meetingLink: string;
}
