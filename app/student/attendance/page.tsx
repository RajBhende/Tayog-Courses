import { StudentAttendanceHeader } from "./components/student-attendance-header";
import { StudentAttendanceView } from "./components/student-attendance-view";

export default function StudentAttendancePage() {
  return (
    <div className="space-y-6">
      <StudentAttendanceHeader />
      <StudentAttendanceView />
    </div>
  );
}

