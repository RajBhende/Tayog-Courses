"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EditAssignmentDialog } from "@/components/teacher/EditAssignmentDialog";
import { SubmissionsTable } from "@/components/teacher/SubmissionsTable";
import { FileViewerDialog } from "@/components/ui/FileViewerDialog";
import { useAssignment } from "@/hooks/teacher/assignments/useAssignment";
import { Clock, FileText, ArrowLeft, Edit } from "lucide-react";
import { format } from "date-fns";

// Helper function to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const assignmentId = params?.id as string;
  const { data: assignment, isLoading } = useAssignment(assignmentId);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [fileViewerOpen, setFileViewerOpen] = React.useState(false);
  const [fileViewerUrl, setFileViewerUrl] = React.useState<string>("");
  const [fileViewerName, setFileViewerName] = React.useState<string>("");

  // Authentication check
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/teacher/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  // Get submissions with initials
  const submissions = React.useMemo(() => {
    if (!assignment?.studentSubmissions) return [];
    return assignment.studentSubmissions.map((sub) => ({
      ...sub,
      studentInitials: getInitials(sub.studentName),
    }));
  }, [assignment?.studentSubmissions]);

  // Format due date
  const formattedDueDate = React.useMemo(() => {
    if (!assignment?.dueDate) return "";
    try {
      const date = new Date(assignment.dueDate);
      return format(date, "MMM dd, yyyy");
    } catch {
      return assignment.dueDate;
    }
  }, [assignment?.dueDate]);

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-4 pt-6">
              <Skeleton className="h-6 w-48" />
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if not authenticated or not a teacher
  if (status === "unauthenticated" || session?.user?.role !== "TEACHER") {
    return null;
  }

  if (!assignment) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-8 text-muted-foreground">
          Assignment not found
        </div>
      </div>
    );
  }

  return (
    <>
      <EditAssignmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        assignment={assignment}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Assignment
          </Button>
        </div>

        {/* Assignment Details */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Assignment Title and Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                  {assignment.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold leading-none">
                      {assignment.submissions || 0}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                      Submissions
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Due: {formattedDueDate}</span>
                </div>
                {assignment.attachment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (assignment.attachment) {
                        setFileViewerUrl(assignment.attachment);
                        setFileViewerName(assignment.title);
                        setFileViewerOpen(true);
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Attachment
                  </Button>
                )}
              </div>
            </div>

            {/* Assignment Description */}
            {assignment.description && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Assignment Instructions:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            )}

            {/* Student Submissions Section */}
            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student Submissions ({submissions.length})
              </Label>
                </div>
              <SubmissionsTable submissions={submissions} />
            </div>
          </CardContent>
        </Card>
      </div>
      <FileViewerDialog
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileUrl={fileViewerUrl}
        fileName={fileViewerName}
      />
    </>
  );
}
