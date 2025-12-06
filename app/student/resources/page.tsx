import { StudentResourcesHeader } from "@/components/student/StudentResourcesHeader";
import { StudentResourcesGrid } from "@/components/student/StudentResourcesGrid";

export default function StudentResourcesPage() {
  return (
    <div className="space-y-6">
      <StudentResourcesHeader />
      <StudentResourcesGrid />
    </div>
  );
}

