"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Clock, FileText, Download, MessageSquare, Upload, X, CheckCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubmitAssignment } from "@/hooks/student/assignments/useSubmitAssignment";
import type { StudentAssignment } from "@/hooks/student/assignments/useAssignments";

interface StudentAssignmentCardProps {
  assignment: StudentAssignment;
  expandedId: string | null;
  onExpandChange: (id: string | null) => void;
}

export function StudentAssignmentCard({
  assignment,
  expandedId,
  onExpandChange,
}: StudentAssignmentCardProps) {
  const [submissionText, setSubmissionText] = React.useState(assignment.submission || "");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const { mutate: submitAssignment, isPending: isSubmitting } = useSubmitAssignment();
  const [isSubmitted, setIsSubmitted] = React.useState(assignment.status !== "pending");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isExpanded = expandedId === assignment.id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!submissionText.trim() && !selectedFile) {
      alert("Please provide either text submission or upload a file");
      return;
    }

    let fileUrl: string | undefined;
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          fileUrl = data.url;
        } else {
          fileUrl = `/uploads/${Date.now()}-${selectedFile.name}`;
        }
      } catch (error) {
        console.error('File upload error:', error);
        fileUrl = `/uploads/${Date.now()}-${selectedFile.name}`;
      }
    }

    submitAssignment(
      {
        assignmentId: assignment.id,
        summary: submissionText,
        fileUrl,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: (error) => {
          console.error("Error submitting assignment:", error);
          alert("Failed to submit assignment. Please try again.");
        },
      }
    );
  };

  const getStatusBadge = () => {
    if (assignment.status === "graded" && assignment.grade) {
      return (
        <Badge className="bg-green-500 text-white px-3 py-1 text-sm">
          Grade: {assignment.grade}
        </Badge>
      );
    }
    if (isSubmitted || assignment.status === "submitted") {
      return (
        <Badge className="bg-blue-500 text-white px-3 py-1 text-sm">
          Submitted
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500 text-white px-3 py-1 text-sm">
        Pending
      </Badge>
    );
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={(open) => onExpandChange(open ? assignment.id : null)}
    >
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardContent
            className={cn(
              "p-4 cursor-pointer transition-colors",
              "hover:bg-accent/50",
              isExpanded && "bg-accent/30"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-base truncate">
                    {assignment.title}
                  </h3>
                  {getStatusBadge()}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
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
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                  isExpanded && "rotate-90"
                )}
              />
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-6 space-y-6">
            {/* Assignment Prompt/Description */}
            {(assignment.title || assignment.description) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Assignment Instructions:</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.title || assignment.description}
                </p>
              </div>
            )}

            {/* Your Work Section */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                YOUR WORK
              </Label>
              {isSubmitted && assignment.submission ? (
                <div className="p-4 bg-muted/50 rounded-md border text-sm">
                  {assignment.submission}
                </div>
              ) : (
                <Textarea
                  placeholder="Write your assignment here..."
                  className="min-h-[120px]"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  disabled={isSubmitted}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* File Upload for Proof */}
              {!isSubmitted && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upload Proof/File (Optional)
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isSubmitting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    {selectedFile && (
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {selectedFile.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isSubmitted && assignment.submittedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Submitted file: {assignment.submittedFile}</span>
                </div>
              )}
            </div>

            {/* Feedback from Instructor */}
            {assignment.feedback && (
              <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <Label className="text-sm font-semibold text-purple-900">
                    Feedback from Instructor
                  </Label>
                </div>
                <p className="text-sm text-purple-800">{assignment.feedback}</p>
              </div>
            )}

            {/* Submit Button for Pending Assignments */}
            {!isSubmitted && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!submissionText.trim() && !selectedFile)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            )}

            {/* Submitted Confirmation */}
            {isSubmitted && assignment.status !== "graded" && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Your assignment has been submitted and is awaiting grading.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

