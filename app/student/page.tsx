"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { CourseSelectionDialog } from "@/components/student/CourseSelectionDialog";
import { StudentDashboardStats } from "@/components/student/StudentDashboardStats";
import { StudentUpcomingDeadlines } from "@/components/student/StudentUpcomingDeadlines";
import { StudentNextClass } from "@/components/student/StudentNextClass";
import { useCourseStore } from "@/lib/courseStore";

export default function StudentDashboardPage() {
  const { selectedCourse, selectedCourseId } = useCourseStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  if (!selectedCourseId || !selectedCourse) {
    return (
      <>
        <CourseSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold">No Course Selected</h2>
            <p className="text-muted-foreground">
              Please select a course to view your dashboard
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              Select Course
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CourseSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back!
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedCourse.name} - Here is what's happening in your classroom today.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Change Course
          </Button>
        </div>

        {/* Summary Cards */}
        <StudentDashboardStats courseId={selectedCourseId} />

        {/* Bottom Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <StudentUpcomingDeadlines courseId={selectedCourseId} />
          <StudentNextClass courseId={selectedCourseId} />
        </div>
      </div>
    </>
  );
}

