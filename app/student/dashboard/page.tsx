"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { StudentDashboardStats } from "@/components/student/StudentDashboardStats";
import { StudentUpcomingDeadlines } from "@/components/student/StudentUpcomingDeadlines";
import { StudentNextClass } from "@/components/student/StudentNextClass";
import { useCourseStore } from "@/lib/courseStore";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { selectedCourse, selectedCourseId } = useCourseStore();

  React.useEffect(() => {
    if (!selectedCourseId || !selectedCourse) {
      router.replace("/student/lobby");
    }
  }, [selectedCourseId, selectedCourse, router]);

  if (!selectedCourseId || !selectedCourse) {
    return null;
  }

  return (
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
          onClick={() => router.push("/student/lobby")}
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
  );
}
