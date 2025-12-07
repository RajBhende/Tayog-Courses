"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { StudentDashboardStats } from "@/components/student/StudentDashboardStats";
import { StudentUpcomingDeadlines } from "@/components/student/StudentUpcomingDeadlines";
import { StudentNextClass } from "@/components/student/StudentNextClass";
import { useCourseStore } from "@/lib/courseStore";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { selectedCourse, selectedCourseId } = useCourseStore();

  // Authentication check
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/student/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "STUDENT") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  React.useEffect(() => {
    if (!selectedCourseId || !selectedCourse) {
      router.replace("/student/lobby");
    }
  }, [selectedCourseId, selectedCourse, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="space-y-8">
        {/* Welcome Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Bottom Sections Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a student
  if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
    return null;
  }

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
