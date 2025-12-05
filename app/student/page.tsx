import { StudentDashboardStats } from "./components/student-dashboard-stats";
import { StudentUpcomingDeadlines } from "./components/student-upcoming-deadlines";
import { StudentNextClass } from "./components/student-next-class";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Alice!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is what's happening in your classes today.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <StudentDashboardStats />

      {/* Bottom Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <StudentUpcomingDeadlines />
        <StudentNextClass />
      </div>
    </div>
  );
}

