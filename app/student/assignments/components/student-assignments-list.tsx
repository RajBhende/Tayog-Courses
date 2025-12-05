"use client";

import * as React from "react";
import { StudentAssignmentCard } from "./student-assignment-card";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  attachment?: string;
  status: "pending" | "submitted" | "graded";
  grade?: string;
  prompt?: string;
  description?: string;
  submission?: string;
  feedback?: string;
}

const assignments: Assignment[] = [
  {
    id: "1",
    title: "History of Thermodynamics",
    dueDate: "2023-11-15",
    attachment: "thermo_guide.pdf",
    status: "graded",
    grade: "85/100",
    description: "Write a 500-word essay on the laws of thermodynamics.",
    submission: "Thermodynamics is the branch of physics that deals with heat, work, and temperature, and their relation to energy, entropy, and the physical properties of matter and radiation...",
    feedback: "Good overview, but you missed the 3rd law.",
  },
  {
    id: "2",
    title: "Calculus Worksheet 4",
    dueDate: "2023-11-20",
    status: "pending",
    description: "Complete all problems on pages 45-50 of your textbook.",
  },
];

export function StudentAssignmentsList() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

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

