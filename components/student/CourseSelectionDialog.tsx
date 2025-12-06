"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import type { Course } from "@/types";

interface CourseSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseSelectionDialog({
  open,
  onOpenChange,
}: CourseSelectionDialogProps) {
  const router = useRouter();
  const { setSelectedCourse, setHasShownDialog } = useCourseStore();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["student", "courses"],
    queryFn: async () => {
      const response = await api.get<Array<{ success: boolean } & Course>>("/student/courses");
      return response.data.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        thumbnail: course.thumbnail,
        teacherId: course.teacherId,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      }));
    },
  });

  const handleCourseSelect = (course: Course) => {
    setSelectedCourseId(course.id);
    setSelectedCourse(course, "STUDENT");
    setHasShownDialog(true);
    router.push("/student");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Select Your Course</DialogTitle>
              <DialogDescription>
                Choose a course to view its dashboard and access your classes
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No courses available</h3>
              <p className="text-sm text-muted-foreground">
                You haven't been enrolled in any courses yet. Please contact your teacher.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50",
                  selectedCourseId === course.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 mt-1">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.name}</h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

