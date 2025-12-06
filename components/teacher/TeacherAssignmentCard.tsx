"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Clock, FileText, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  attachment?: string;
  description?: string;
  submissions: number;
}

interface StudentSubmission {
  id: string;
  studentName: string;
  studentInitials: string;
  submission: string;
  submittedFile?: string;
  grade?: string;
  feedback?: string;
}

interface TeacherAssignmentCardProps {
  assignment: Assignment;
  submissions?: StudentSubmission[];
}

export function TeacherAssignmentCard({
  assignment,
  submissions = [],
}: TeacherAssignmentCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardContent
            className={cn(
              "p-4 cursor-pointer transition-colors",
              "hover:bg-accent/50",
              expanded && "bg-accent/30"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-2 truncate">
                  {assignment.title}
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  {assignment.attachment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 hover:bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      {assignment.attachment}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold leading-none">
                    {assignment.submissions}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    Submissions
                  </span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                    expanded && "rotate-90"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-6 space-y-6">
            {/* Assignment Description */}
            {assignment.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Assignment Instructions:</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.description}
                </p>
              </div>
            )}

            {/* Student Submissions Section */}
            <div className="space-y-4">
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
                            <span className="font-medium text-sm">
                              {submission.studentName}
                            </span>
                          </div>
                          {submission.grade && (
                            <Badge className="bg-green-500 text-white px-3 py-1 text-sm">
                              Graded: {submission.grade}
                            </Badge>
                          )}
                        </div>

                        {/* Submission Preview */}
                        <div className="p-3 bg-muted/50 rounded-md border text-sm">
                          {submission.submission}
                        </div>

                        {submission.submittedFile && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Submitted file: {submission.submittedFile}</span>
                          </div>
                        )}

                        {/* Feedback Section */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider">
                            Feedback
                          </Label>
                          <Textarea
                            placeholder="Add your feedback here..."
                            defaultValue={submission.feedback || ""}
                            className="min-h-[80px] text-sm"
                          />
                        </div>

                        {/* Grade and Action */}
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              defaultValue={submission.grade?.split("/")[0] || ""}
                              className="w-16 h-8 text-sm"
                              placeholder="85"
                            />
                            <span className="text-sm text-muted-foreground">/100</span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-8"
                          >
                            Return to Student
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No submissions yet
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

