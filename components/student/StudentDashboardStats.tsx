"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignments } from "@/hooks/student/assignments/useAssignments";
import { useSchedules } from "@/hooks/student/schedule/useSchedules";

interface StudentDashboardStatsProps {
  courseId?: string | null;
}

export function StudentDashboardStats({ courseId }: StudentDashboardStatsProps) {
  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignments();
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();

  // Filter active assignments (pending status)
  const activeAssignments = assignments.filter(
    (a) => a.status === "pending" || a.status === "submitted"
  );

  // Filter upcoming classes (future dates)
  const now = new Date();
  const upcomingClasses = schedules.filter(
    (s) => new Date(s.time) >= now
  );

  const isLoading = assignmentsLoading || schedulesLoading;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mb-2" />
              ) : (
                <CardTitle className="text-3xl font-bold">
                  {activeAssignments.length}
                </CardTitle>
              )}
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
              {isLoading ? (
                <Skeleton className="h-8 w-12 mb-2" />
              ) : (
                <CardTitle className="text-3xl font-bold">
                  {upcomingClasses.length}
                </CardTitle>
              )}
              <p className="text-sm text-muted-foreground">Upcoming Classes</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

