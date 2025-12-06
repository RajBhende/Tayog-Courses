"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Users, Clock, Video } from "lucide-react";
import { CourseSelectionDialog } from "@/components/teacher/CourseSelectionDialog";

// Mock course data - will be replaced with API later
const COURSE_DATA: Record<
  string,
  {
    name: string;
    code: string;
    activeAssignments: number;
    upcomingClasses: number;
    enrolledStudents: number;
    deadlines: Array<{ title: string; dueDate: string }>;
    nextClass: { time: string; topic: string };
  }
> = {
  "1": {
    name: "History",
    code: "HIST101",
    activeAssignments: 3,
    upcomingClasses: 2,
    enrolledStudents: 25,
    deadlines: [
      { title: "World War II Essay", dueDate: "2024-12-15" },
      { title: "Ancient Civilizations Quiz", dueDate: "2024-12-20" },
    ],
    nextClass: { time: "10:00 AM Today", topic: "Renaissance Period" },
  },
  "2": {
    name: "Mathematics",
    code: "MATH201",
    activeAssignments: 5,
    upcomingClasses: 3,
    enrolledStudents: 30,
    deadlines: [
      { title: "Calculus Worksheet 4", dueDate: "2024-12-18" },
      { title: "Linear Algebra Assignment", dueDate: "2024-12-22" },
    ],
    nextClass: { time: "2:00 PM Today", topic: "Differential Equations" },
  },
  "3": {
    name: "Physics",
    code: "PHYS301",
    activeAssignments: 2,
    upcomingClasses: 1,
    enrolledStudents: 20,
    deadlines: [
      { title: "Mechanics Lab Report", dueDate: "2024-12-16" },
      { title: "Thermodynamics Problem Set", dueDate: "2024-12-21" },
    ],
    nextClass: { time: "11:00 AM Today", topic: "Kinematics" },
  },
  "4": {
    name: "Chemistry",
    code: "CHEM201",
    activeAssignments: 4,
    upcomingClasses: 2,
    enrolledStudents: 28,
    deadlines: [
      { title: "Organic Chemistry Lab", dueDate: "2024-12-17" },
      { title: "Periodic Table Quiz", dueDate: "2024-12-19" },
    ],
    nextClass: { time: "9:00 AM Today", topic: "Chemical Bonding" },
  },
  "5": {
    name: "English",
    code: "ENG101",
    activeAssignments: 3,
    upcomingClasses: 2,
    enrolledStudents: 22,
    deadlines: [
      { title: "Shakespeare Analysis Essay", dueDate: "2024-12-14" },
      { title: "Poetry Reading Assignment", dueDate: "2024-12-23" },
    ],
    nextClass: { time: "1:00 PM Today", topic: "Literary Analysis" },
  },
  "6": {
    name: "Computer Science",
    code: "CS301",
    activeAssignments: 6,
    upcomingClasses: 4,
    enrolledStudents: 35,
    deadlines: [
      { title: "Data Structures Project", dueDate: "2024-12-15" },
      { title: "Algorithm Design Assignment", dueDate: "2024-12-20" },
    ],
    nextClass: { time: "3:00 PM Today", topic: "Binary Trees" },
  },
};

export default function TeacherDashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
              Welcome back, Prof. Smith!
            </h1>
            <p className="text-muted-foreground mt-1">
              {courseData.name} ({courseData.code}) Dashboard
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
                    {courseData.activeAssignments}
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
                    {courseData.upcomingClasses}
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
                    {courseData.enrolledStudents}
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
              {courseData.deadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="relative pl-4 border-l-2 border-red-500"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {deadline.dueDate}
                    </p>
                  </div>
                </div>
              ))}
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
              <div className="relative bg-blue-600 rounded-lg p-6 text-white">
                <div className="absolute top-4 right-4">
                  <Video className="h-5 w-5 text-white/80" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-100">
                      {courseData.nextClass.time}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold">{courseData.name}</h3>
                    <p className="text-blue-100">{courseData.nextClass.topic}</p>
                  </div>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    Join Classroom
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
