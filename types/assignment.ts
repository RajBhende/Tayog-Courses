export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submission: string;
  submittedFile?: string;
  grade?: string;
  feedback?: string;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachment?: string | null;
  courseId: string;
  submissions?: number;
  studentSubmissions?: StudentSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentInput {
  title: string;
  description: string;
  dueDate: string;
  attachment?: string;
}

export interface AssignmentResponse {
  success: boolean;
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachment?: string | null;
  submissions?: number;
}
