"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, ChevronRight, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

import { EditAssignmentDialog } from "@/components/teacher/EditAssignmentDialog";
import { format } from "date-fns";
import type { Assignment } from "@/types";

interface TeacherAssignmentCardProps {
  assignment: Assignment;
}

export function TeacherAssignmentCard({
  assignment,
}: TeacherAssignmentCardProps) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  // Format due date to show only date (no time)
  const formattedDueDate = React.useMemo(() => {
    try {
      const date = new Date(assignment.dueDate);
      return format(date, "MMM dd, yyyy");
    } catch {
      return assignment.dueDate;
    }
  }, [assignment.dueDate]);

  const handleCardClick = () => {
    router.push(`/teacher/assignments/${assignment.id}`);
  };

  return (
    <>
      <EditAssignmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        assignment={assignment}
      />
      <Card className="overflow-hidden transition-all duration-200">
        <CardContent
          className={cn(
            "p-4 cursor-pointer transition-colors relative",
            "hover:bg-accent/50"
          )}
          onClick={handleCardClick}
        >
          {/* Edit Icon - top right corner */}
          <Edit
            className="absolute top-4 right-4 h-4 w-4 text-muted-foreground cursor-pointer hover:text-blue-600 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setEditDialogOpen(true);
            }}
          />

          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-2 truncate">
                {assignment.title}
              </h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Due: {formattedDueDate}</span>
                </div>
                {assignment.attachment && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span>File attached</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Submissions count */}
              <div className="flex flex-col">
                <span className="text-2xl font-bold leading-none">
                  {assignment.submissions || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                  Submissions
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

