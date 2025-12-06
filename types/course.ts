export interface Course {
  id: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  name: string;
  description?: string;
  thumbnail?: string;
}

export interface CourseResponse {
  success: boolean;
  id: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}
