import { StudentAssignmentsList } from "./components/student-assignments-list";
import { StudentAssignmentsHeader } from "./components/student-assignments-header";

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6">
      <StudentAssignmentsHeader />
      <StudentAssignmentsList />
    </div>
  );
}

