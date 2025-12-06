"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CreateAssignmentDialog } from "@/components/teacher/CreateAssignmentDialog";
import { TeacherAssignmentCard } from "@/components/teacher/TeacherAssignmentCard";
import { useAssignments } from "@/hooks/teacher/assignments/useAssignments";

export default function AssignmentsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data: assignments = [], isLoading } = useAssignments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Create and grade coursework
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setDialogOpen(true)}
        >
          + Create Assignment
        </Button>
      </div>

      <CreateAssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Assignment Cards List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No assignments found. Create your first assignment!
          </div>
        ) : (
          assignments.map((assignment) => (
            <TeacherAssignmentCard
              key={assignment.id}
              assignment={assignment}
              submissions={[]}
            />
          ))
        )}
      </div>
    </div>
  );
}
