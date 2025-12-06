export interface Student {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  email: string;
}

export interface EnrollStudentInput {
  email: string;
  fullName: string;
}

export interface StudentResponse {
  success: boolean;
  id: string;
  name: string;
  email: string;
}
