import { StudentScheduleHeader } from "./components/student-schedule-header";
import { StudentScheduleTable } from "./components/student-schedule-table";

export default function StudentSchedulePage() {
  return (
    <div className="space-y-6">
      <StudentScheduleHeader />
      <StudentScheduleTable />
    </div>
  );
}

