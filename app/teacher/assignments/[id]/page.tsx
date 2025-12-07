"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EditAssignmentDialog } from "@/components/teacher/EditAssignmentDialog";
import { useAssignment } from "@/hooks/teacher/assignments/useAssignment";
import { Clock, FileText, Download, ArrowLeft, Edit } from "lucide-react";
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
                        window.open(assignment.attachment, '_blank');
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
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student Submissions
              </Label>

              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="border-2">
                      <CardContent className="p-4 space-y-4">
                        {/* Student Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {submission.studentInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {submission.studentName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {submission.studentEmail}
                              </span>
                            </div>
                          </div>
                          {submission.grade && (
                            <Badge className="bg-green-500 text-white px-3 py-1 text-sm">
                              Graded: {submission.grade}
                            </Badge>
                          )}
                        </div>

                        {/* Submission Text */}
                        {submission.submission && (
                          <div className="p-3 bg-muted/50 rounded-md border text-sm whitespace-pre-wrap">
                            {submission.submission}
                          </div>
                        )}

                        {/* Submitted File */}
                        {submission.submittedFile && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (submission.submittedFile) {
                                  window.open(submission.submittedFile, '_blank');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Submitted File
                            </Button>
                          </div>
                        )}

                        {/* Feedback Section */}
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold uppercase tracking-wider">
                            Feedback
                          </Label>
                          <Textarea
                            placeholder="Add your feedback here..."
                            defaultValue={submission.feedback || ""}
                            className="min-h-[100px] text-sm"
                          />
                        </div>

                        {/* Grade and Action */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              defaultValue={submission.grade?.split("/")[0] || ""}
                              className="w-20 h-9 text-sm"
                              placeholder="85"
                              min="0"
                              max="100"
                            />
                            <span className="text-sm text-muted-foreground">/100</span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-9"
                          >
                            Return to Student
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg">
                  No submissions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
