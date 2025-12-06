export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachment?: string | null;
  courseId: string;
  submissions?: number;
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
