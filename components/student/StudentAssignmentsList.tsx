"use client";

import * as React from "react";
import { StudentAssignmentCard } from "./StudentAssignmentCard";
import { useAssignments } from "@/hooks/student/assignments/useAssignments";

export function StudentAssignmentsList() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { data: assignments = [], isLoading } = useAssignments();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading assignments...
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

