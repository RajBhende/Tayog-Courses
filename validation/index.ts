// Auth
export {
  signupSchema,
  signupApiSchema,
  type SignupFormValues,
  type SignupApiValues,
  type SignupFormData,
  type SignupApiData,
} from "./auth/auth.schema";

// Assignments
export {
  createAssignmentSchema,
  type CreateAssignmentFormValues,
  type CreateAssignmentFormData,
  type AssignmentDetails,
} from "./assignments/assignment.schema";

// Schedule
export {
  scheduleClassSchema,
  type ScheduleClassFormValues,
  type ScheduleClassFormData,
  type ScheduleDetails,
} from "./schedule/schedule.schema";

// Resources
export {
  uploadResourceSchema,
  type UploadResourceFormValues,
  type UploadResourceFormData,
  type ResourceDetails,
} from "./resources/resource.schema";

// Students
export {
  enrollStudentSchema,
  type EnrollStudentFormValues,
  type EnrollStudentFormData,
  type StudentDetails,
} from "./students/student.schema";

