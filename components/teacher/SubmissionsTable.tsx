"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, CheckCircle, ChevronDown, ChevronUp, FileText, Filter } from "lucide-react";
import { useSubmitFeedback } from "@/hooks/teacher/assignments/useSubmitFeedback";
import { FileViewerDialog } from "@/components/ui/FileViewerDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submission: string;
  submittedFile?: string;
  grade?: string;
  feedback?: string;
  studentInitials: string;
  submittedAt?: string;
}

interface SubmissionsTableProps {
  submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [fileViewerOpen, setFileViewerOpen] = React.useState(false);
  const [fileViewerUrl, setFileViewerUrl] = React.useState<string>("");
  const [fileViewerName, setFileViewerName] = React.useState<string>("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "pending" | "graded" | "feedback">("all");

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter submissions based on status
  const filteredSubmissions = React.useMemo(() => {
    if (filterStatus === "all") return submissions;
    return submissions.filter((sub) => {
      if (filterStatus === "graded") return !!sub.grade;
      if (filterStatus === "feedback") return !!sub.feedback && !sub.grade;
      if (filterStatus === "pending") return !sub.feedback && !sub.grade;
      return true;
    });
  }, [submissions, filterStatus]);

  const handleViewFile = (url: string, studentName: string) => {
    setFileViewerUrl(url);
    setFileViewerName(`${studentName}'s Submission`);
    setFileViewerOpen(true);
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground border rounded-lg">
        No submissions yet
      </div>
    );
  }

  const pendingCount = submissions.filter(s => !s.feedback && !s.grade).length;
  const gradedCount = submissions.filter(s => !!s.grade).length;
  const feedbackCount = submissions.filter(s => !!s.feedback && !s.grade).length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Total: <span className="font-medium text-foreground">{submissions.length}</span>
          </span>
          <span className="text-muted-foreground">
            Pending: <span className="font-medium text-yellow-600">{pendingCount}</span>
          </span>
          <span className="text-muted-foreground">
            Graded: <span className="font-medium text-green-600">{gradedCount}</span>
          </span>
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="pending">Pending ({pendingCount})</SelectItem>
            <SelectItem value="feedback">Feedback Given ({feedbackCount})</SelectItem>
            <SelectItem value="graded">Graded ({gradedCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => {
              const isExpanded = expandedId === submission.id;
              const hasGrade = !!submission.grade;
              const hasFeedback = !!submission.feedback;

              return (
                <React.Fragment key={submission.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleToggleExpand(submission.id)}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleExpand(submission.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
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
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm line-clamp-2">
                          {submission.submission || "No text submission"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.submittedFile ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFile(submission.submittedFile!, submission.studentName);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No file</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasGrade ? (
                        <Badge className="bg-green-500 text-white">
                          Graded
                        </Badge>
                      ) : hasFeedback ? (
                        <Badge className="bg-blue-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Feedback Given
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {submission.grade ? (
                        <span className="font-semibold text-green-600">
                          {submission.grade}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <Card className="m-4 border-2">
                          <CardContent className="p-6 space-y-4">
                            {/* Full Submission Text */}
                            {submission.submission && (
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider">
                                  Submission Text
                                </Label>
                                <div className="p-3 bg-muted/50 rounded-md border text-sm whitespace-pre-wrap">
                                  {submission.submission}
                                </div>
                              </div>
                            )}

                            {/* Submitted File */}
                            {submission.submittedFile && (
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider">
                                  Submitted File
                                </Label>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewFile(submission.submittedFile!, submission.studentName)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  View Submitted File
                                </Button>
                              </div>
                            )}

                            {/* Feedback Form */}
                            <SubmissionRowForm submission={submission} />
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
              })
            )}
          </TableBody>
        </Table>
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

// Separate component for the feedback form in expanded row
function SubmissionRowForm({ submission }: { submission: Submission }) {
  const [feedback, setFeedback] = React.useState(submission.feedback || "");
  const [grade, setGrade] = React.useState(
    submission.grade?.split("/")[0] || ""
  );
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();
  const [isSubmitted, setIsSubmitted] = React.useState(!!submission.feedback);

  React.useEffect(() => {
    setFeedback(submission.feedback || "");
    setGrade(submission.grade?.split("/")[0] || "");
    setIsSubmitted(!!submission.feedback);
  }, [submission.feedback, submission.grade]);

  const handleSubmit = () => {
    if (!feedback.trim()) {
      alert("Please provide feedback before submitting.");
      return;
    }

    const gradeNumber = grade ? parseInt(grade, 10) : undefined;
    if (gradeNumber !== undefined && (gradeNumber < 0 || gradeNumber > 100)) {
      alert("Grade must be between 0 and 100.");
      return;
    }

    submitFeedback(
      {
        submissionId: submission.id,
        comment: feedback.trim(),
        grade: gradeNumber,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
        onError: (error) => {
          console.error("Error submitting feedback:", error);
          alert("Failed to submit feedback. Please try again.");
        },
      }
    );
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider">
          Feedback
        </Label>
        <Textarea
          placeholder="Add your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[100px] text-sm"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-20 h-9 text-sm"
            placeholder="85"
            min="0"
            max="100"
            disabled={isPending}
          />
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 h-9"
          onClick={handleSubmit}
          disabled={isPending || !feedback.trim()}
        >
          {isPending ? "Submitting..." : isSubmitted ? "Update Feedback" : "Submit Feedback"}
        </Button>
      </div>

      {submission.grade && (
        <div className="p-3 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Graded: {submission.grade}
            </span>
          </div>
          {submission.feedback && (
            <p className="text-sm text-green-700 mt-2">{submission.feedback}</p>
          )}
        </div>
      )}
    </div>
  );
}
