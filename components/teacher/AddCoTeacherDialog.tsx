"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCourseStore } from "@/lib/courseStore";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface AddCoTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCoTeacherDialog({
  open,
  onOpenChange,
}: AddCoTeacherDialogProps) {
  const { selectedCourseId } = useCourseStore();
  const [teacherCode, setTeacherCode] = React.useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  const addCoTeacher = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post("/teacher/co-teachers", {
        teacherCode: code,
        courseId: selectedCourseId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "people", selectedCourseId] });
      setTeacherCode("");
      onOpenChange(false);
      alert("Successfully added as co-teacher!");
      router.refresh();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Failed to add co-teacher";
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherCode.trim()) {
      alert("Please enter a teacher code");
      return;
    }
    addCoTeacher.mutate(teacherCode.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Co-Teacher</DialogTitle>
          <DialogDescription>
            Enter the teacher code to join as a co-teacher for this course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacherCode">Teacher Code</Label>
            <Input
              id="teacherCode"
              placeholder="TEACH-XXXX-YYYY"
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
              disabled={addCoTeacher.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Enter the teacher code shared by the main teacher
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setTeacherCode("");
              }}
              disabled={addCoTeacher.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addCoTeacher.isPending || !teacherCode.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {addCoTeacher.isPending ? "Adding..." : "Add Co-Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

