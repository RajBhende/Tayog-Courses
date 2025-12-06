import { StudentScheduleHeader } from "@/components/student/StudentScheduleHeader";
import { StudentScheduleTable } from "@/components/student/StudentScheduleTable";

export default function StudentSchedulePage() {
  return (
    <div className="space-y-6">
      <StudentScheduleHeader />
      <StudentScheduleTable />
    </div>
  );
}

