import { StudentResourcesHeader } from "./components/student-resources-header";
import { StudentResourcesGrid } from "./components/student-resources-grid";

export default function StudentResourcesPage() {
  return (
    <div className="space-y-6">
      <StudentResourcesHeader />
      <StudentResourcesGrid />
    </div>
  );
}

