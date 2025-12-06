"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useAssignments } from "@/hooks/student/assignments/useAssignments";
import { format } from "date-fns";

interface StudentUpcomingDeadlinesProps {
  courseId?: string | null;
}

export function StudentUpcomingDeadlines({
  courseId,
}: StudentUpcomingDeadlinesProps) {
  const { data: assignments = [], isLoading } = useAssignments();

  const pendingAssignments = assignments
    .filter((a) => a.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Upcoming Deadlines</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Upcoming Deadlines</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingAssignments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No upcoming deadlines</div>
        ) : (
          pendingAssignments.map((assignment) => (
            <div key={assignment.id} className="relative pl-4 border-l-2 border-red-500">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{assignment.title}</p>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

