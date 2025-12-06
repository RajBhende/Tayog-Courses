"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";

// Mock course-specific stats - will be replaced with API later
const COURSE_STATS: Record<
  string,
  { activeAssignments: number; upcomingClasses: number }
> = {
  "1": { activeAssignments: 3, upcomingClasses: 2 },
  "2": { activeAssignments: 5, upcomingClasses: 3 },
  "3": { activeAssignments: 2, upcomingClasses: 1 },
  "4": { activeAssignments: 4, upcomingClasses: 2 },
  "5": { activeAssignments: 3, upcomingClasses: 2 },
  "6": { activeAssignments: 6, upcomingClasses: 4 },
};

interface StudentDashboardStatsProps {
  courseId?: string | null;
}

export function StudentDashboardStats({ courseId }: StudentDashboardStatsProps) {
  // Use mock data if courseId is provided, otherwise use default
  const stats = courseId
    ? COURSE_STATS[courseId] || { activeAssignments: 2, upcomingClasses: 2 }
    : { activeAssignments: 2, upcomingClasses: 2 };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                {stats.activeAssignments}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Active Assignments</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                {stats.upcomingClasses}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Upcoming Classes</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

