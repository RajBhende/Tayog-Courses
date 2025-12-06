"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Users, Clock, Video } from "lucide-react";
import { CourseSelectionDialog } from "@/components/teacher/CourseSelectionDialog";
import { useCourseStore } from "@/lib/courseStore";
import { useAssignments } from "@/hooks/teacher/assignments/useAssignments";
import { useStudents } from "@/hooks/teacher/students/useStudents";
import { useSchedules } from "@/hooks/teacher/schedule/useSchedules";

export default function TeacherDashboardPage() {
  const { selectedCourse, selectedCourseId } = useCourseStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data: assignments = [] } = useAssignments();
  const { data: students = [] } = useStudents();
  const { data: schedules = [] } = useSchedules();

  const upcomingSchedules = schedules.filter(
    (schedule) => new Date(schedule.time) >= new Date()
  );

  const upcomingDeadlines = assignments
    .filter((assignment) => new Date(assignment.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const nextClass = upcomingSchedules[0];

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
              {selectedCourse.name} Dashboard
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
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {assignments.length}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Active Assignments
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {upcomingSchedules.length}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upcoming Classes
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {students.length}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enrolled Students
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Bottom Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Upcoming Deadlines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="relative pl-4 border-l-2 border-red-500"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>

          {/* Next Live Class */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <CardTitle>Next Live Class</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {nextClass ? (
                <div className="relative bg-blue-600 rounded-lg p-6 text-white">
                  <div className="absolute top-4 right-4">
                    <Video className="h-5 w-5 text-white/80" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-blue-100">
                        {new Date(nextClass.time).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold">{nextClass.subject}</h3>
                      <p className="text-blue-100">{nextClass.topic}</p>
                    </div>
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                      Join Classroom
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming classes</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
