"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createCourseSchema, type CreateCourseFormValues } from "@/validation/courses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Course } from "@/types";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: (course: Course) => void;
}

export function CreateCourseDialog({
  open,
  onOpenChange,
  onCourseCreated,
}: CreateCourseDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createCourse = useMutation({
    mutationFn: async (data: CreateCourseFormValues) => {
      const response = await api.post<{ success: boolean } & Course>("/teacher/courses", data);
      const courseData = response.data;
      return {
        id: courseData.id,
        name: courseData.name,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        teacherId: courseData.teacherId,
        createdAt: courseData.createdAt,
        updatedAt: courseData.updatedAt,
      };
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      form.reset();
      onCourseCreated?.(course);
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CreateCourseFormValues) => {
    createCourse.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Course</DialogTitle>
          <DialogDescription>
            Create a new course to start managing your classes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Mathematics 101"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Brief description of the course..."
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCourse.isPending}>
              {createCourse.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

