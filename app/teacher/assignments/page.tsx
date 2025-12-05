"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CreateAssignmentDialog } from "./create-assignment-dialog";
import { TeacherAssignmentCard } from "./components/teacher-assignment-card";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  attachment?: string;
  description?: string;
  submissions: number;
}

const assignments: Assignment[] = [
  {
    id: "1",
    title: "History of Thermodynamics",
    dueDate: "2023-11-15",
    attachment: "thermo_guide.pdf",
    description: "Write a 500-word essay on the laws of thermodynamics.",
    submissions: 2,
  },
  {
    id: "2",
    title: "Calculus Worksheet 4",
    dueDate: "2023-11-20",
    description: "Complete all problems on pages 45-50 of your textbook.",
    submissions: 0,
  },
];

export default function AssignmentsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

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
        {assignments.map((assignment) => (
          <TeacherAssignmentCard
            key={assignment.id}
            assignment={assignment}
            submissions={
              assignment.submissions > 0
                ? [
                    {
                      id: "1",
                      studentName: "Alice Johnson",
                      studentInitials: "AJ",
                      submission:
                        "Thermodynamics is the branch of physics that deals with heat, work, and temperature, and their relation to energy, entropy, and the physical properties of matter and radiation...",
                      submittedFile: "thermodynamics_essay.pdf",
                      grade: "85/100",
                      feedback: "Good overview, but you missed the 3rd law.",
                    },
                  ]
                : []
            }
          />
        ))}
      </div>
    </div>
  );
}
