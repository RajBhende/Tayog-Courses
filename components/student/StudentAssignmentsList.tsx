"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StudentAssignmentCard } from "./StudentAssignmentCard";
import { useAssignments } from "@/hooks/student/assignments/useAssignments";

export function StudentAssignmentsList() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { data: assignments = [], isLoading } = useAssignments();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No assignments found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <StudentAssignmentCard
          key={assignment.id}
          assignment={assignment}
          expandedId={expandedId}
          onExpandChange={(id) => setExpandedId(id)}
        />
      ))}
    </div>
  );
}

