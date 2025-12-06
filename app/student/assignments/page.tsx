import { StudentAssignmentsList } from "@/components/student/StudentAssignmentsList";
import { StudentAssignmentsHeader } from "@/components/student/StudentAssignmentsHeader";

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6">
      <StudentAssignmentsHeader />
      <StudentAssignmentsList />
    </div>
  );
}

