"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { CourseSelectionDialog } from "@/components/student/CourseSelectionDialog";
import { StudentDashboardStats } from "@/components/student/StudentDashboardStats";
import { StudentUpcomingDeadlines } from "@/components/student/StudentUpcomingDeadlines";
import { StudentNextClass } from "@/components/student/StudentNextClass";

// Mock course data - will be replaced with API later
const COURSE_DATA: Record<
  string,
  {
    name: string;
    code: string;
  }
> = {
  "1": { name: "History", code: "HIST101" },
  "2": { name: "Mathematics", code: "MATH201" },
  "3": { name: "Physics", code: "PHYS301" },
  "4": { name: "Chemistry", code: "CHEM201" },
  "5": { name: "English", code: "ENG101" },
  "6": { name: "Computer Science", code: "CS301" },
};

export default function StudentDashboardPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // Show dialog if no course is selected
    if (!courseId) {
      setDialogOpen(true);
    }
  }, [courseId]);

  const courseData = courseId ? COURSE_DATA[courseId] : null;

  if (!courseId || !courseData) {
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
              Welcome back, Alice!
            </h1>
            <p className="text-muted-foreground mt-1">
              {courseData.name} ({courseData.code}) - Here is what's happening in your classroom today.
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
        <StudentDashboardStats courseId={courseId} />

        {/* Bottom Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <StudentUpcomingDeadlines courseId={courseId} />
          <StudentNextClass courseId={courseId} />
        </div>
      </div>
    </>
  );
}

