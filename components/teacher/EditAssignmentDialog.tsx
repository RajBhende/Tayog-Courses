"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, X, Download } from "lucide-react";
import { format } from "date-fns";
import { cn, extractKeyFromUrl } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  createAssignmentSchema,
  type CreateAssignmentFormValues,
} from "@/validation/assignments";
import { useUpdateAssignment } from "@/hooks/teacher/assignments/useUpdateAssignment";
import type { Assignment } from "@/types";

interface EditAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment;
}

export function EditAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}: EditAssignmentDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const { mutate: updateAssignment, isPending: isLoading } = useUpdateAssignment();

  // Format dueDate from ISO string to YYYY-MM-DD for the form
  const formatDueDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return format(date, "yyyy-MM-dd");
  };

  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: assignment.title || "",
      dueDate: assignment.dueDate ? formatDueDate(assignment.dueDate) : "",
      description: assignment.description || "",
    },
  });

  // Reset form when assignment changes
  React.useEffect(() => {
    if (assignment) {
      form.reset({
        title: assignment.title || "",
        dueDate: assignment.dueDate ? formatDueDate(assignment.dueDate) : "",
        description: assignment.description || "",
      });
    }
  }, [assignment, form]);

  // Watch form values to enable/disable submit button
  const watchedValues = form.watch();
  const isFormValid = 
    watchedValues.title?.trim().length >= 5 &&
    watchedValues.dueDate?.trim().length > 0 &&
    watchedValues.description?.trim().length >= 20;

  const onSubmit = async (values: CreateAssignmentFormValues) => {
    let attachmentKey: string | undefined;

    // If a new file is provided, upload it to S3
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/teacher/assignments/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'File upload failed');
        }

        const uploadData = await uploadResponse.json();
        attachmentKey = uploadData.key; // Store S3 key, not URL
      } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to upload file. Please try again.');
        return;
      }
    } else {
      // If no new file, keep the existing attachment key
      // Extract key from URL if it's a full URL, otherwise use as is
      if (assignment.attachment) {
        if (assignment.attachment.startsWith("http")) {
          attachmentKey = extractKeyFromUrl(assignment.attachment) || assignment.attachment;
        } else {
          attachmentKey = assignment.attachment;
        }
      }
    }

    updateAssignment(
      {
        assignmentId: assignment.id,
        data: {
          ...values,
          attachment: attachmentKey,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFile(null);
        },
        onError: (error) => {
          console.error("Error updating assignment:", error);
        },
      }
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Validate file type - only PDF allowed
      if (droppedFile.type !== "application/pdf" && !droppedFile.name.toLowerCase().endsWith(".pdf")) {
        alert("Only PDF files are allowed. Please select a PDF file.");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type - only PDF allowed
      if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
        alert("Only PDF files are allowed. Please select a PDF file.");
        e.target.value = ""; // Reset input
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // Prevent closing dialog while loading
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setFile(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
     
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title and Due Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Essay on Hamlet"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Due Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isLoading}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(new Date(field.value + "T00:00:00"), "dd-MM-yyyy")
                            ) : (
                              <span>dd-mm-yyyy</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value
                              ? new Date(field.value + "T00:00:00")
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                            } else {
                              field.onChange("");
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed instructions for the student..."
                      className="min-h-[120px] resize-y"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attach File */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase tracking-wide">
                Attach PDF File (Optional)
              </Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-md p-8 text-center cursor-pointer
                  transition-colors
                  ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }
                `}
              >
                <input
                  type="file"
                  id="file-upload-edit"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  disabled={isLoading}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : assignment.attachment ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-muted-foreground">Current attachment:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (assignment.attachment) {
                          window.open(assignment.attachment, '_blank');
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Current File
                    </Button>
                    <label
                      htmlFor="file-upload-edit"
                      className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                    >
                      Click to replace file
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload-edit"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click or drag PDF file here
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  onOpenChange(false);
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Updating...
                  </>
                ) : (
                  "Update Assignment"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
