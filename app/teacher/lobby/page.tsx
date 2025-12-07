"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import { CreateCourseDialog } from "@/components/teacher/CreateCourseDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/ui/Navbar";
import { signOut } from "next-auth/react";
import type { Course } from "@/types";

interface CourseWithCount extends Course {
  studentCount?: number;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setSelectedCourse, clearCourse } = useCourseStore();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [teacherCode, setTeacherCode] = React.useState("");

  // Authentication check
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/teacher/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  const { data: courses = [], isLoading } = useQuery<CourseWithCount[]>({
    queryKey: ["teacher", "courses"],
    queryFn: async () => {
      const response = await api.get<Array<{ success: boolean; studentCount?: number } & Course>>("/teacher/courses");
      return response.data.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        thumbnail: course.thumbnail,
        teacherId: course.teacherId,
        studentCount: course.studentCount || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      }));
    },
  });

  const joinCourseMutation = useMutation({
    mutationFn: async (code: string) => {
      // TODO: Implement join course API endpoint
      const response = await api.post("/teacher/courses/join", { code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
      setTeacherCode("");
    },
  });

  const handleCourseSelect = (course: CourseWithCount) => {
    setSelectedCourseId(course.id);
    setSelectedCourse(course, "TEACHER");
    router.push("/teacher/dashboard");
  };

  const handleCourseCreated = (course: Course) => {
    handleCourseSelect(course as CourseWithCount);
  };

  const handleJoinCourse = () => {
    if (teacherCode.trim()) {
      joinCourseMutation.mutate(teacherCode.trim());
    }
  };

  const handleLogout = async () => {
    // Clear course store
    clearCourse();
    // Clear any stored authentication data
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    // Sign out from next-auth
    await signOut({ redirect: false });
    // Redirect to landing page with full page reload
    window.location.href = "/";
  };

  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hasCourses = courses.length > 0;
  const userName = session?.user?.name || "User";
  const userInitials = getUserInitials(session?.user?.name);
  const userEmail = session?.user?.email;

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated or not a teacher
  if (status === "unauthenticated" || session?.user?.role !== "TEACHER") {
    return null;
  }

  return (
    <>
      {/* Header Bar */}
      <Navbar
        userName={userName}
        userRole="Teacher"
        userInitials={userInitials}
        userEmail={userEmail}
        avatarColor="purple"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 p-4 pt-8">
        <div className="max-w-7xl mx-auto space-y-4 px-6">
          {/* Dashboard Title and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
              <p className="text-gray-600 mt-1">Select a course to manage or view.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter Teacher Code"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinCourse();
                    }
                  }}
                  className="w-48"
                />
                <Button
                  onClick={handleJoinCourse}
                  disabled={!teacherCode.trim() || joinCourseMutation.isPending}
                  variant="outline"
                  className="bg-gray-200 hover:bg-gray-300"
                >
                  {joinCourseMutation.isPending ? "Joining..." : "Join"}
                </Button>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            </div>
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading courses...</p>
            </div>
          ) : !hasCourses ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-4 rounded-full bg-gray-100">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">No courses yet</h3>
                  <p className="text-sm text-gray-500">
                    Create your first course to get started
                  </p>
                </div>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  New Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-xl overflow-hidden p-0",
                    selectedCourseId === course.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  )}
                  onClick={() => handleCourseSelect(course)}
                >
                  {/* Gradient Top Section */}
                  <CardHeader className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 relative">
                    <div className="absolute top-4 right-4">
                      <Shield className="h-5 w-5 text-white/80" />
                    </div>
                    <CardTitle className="text-white text-lg line-clamp-1">
                      {course.name}
                    </CardTitle>
                    <p className="text-white/90 text-sm mt-1">
                      {course.name.substring(0, 4).toUpperCase()}-{course.id.slice(0, 3).toUpperCase()}
                    </p>
                  </CardHeader>

                  {/* White Bottom Section */}
                  <CardContent className="p-6 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-purple-600">
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {getUserInitials(session?.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8 bg-green-500 -ml-2">
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            {course.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          {course.studentCount || 0} STUDENTS
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateCourseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCourseCreated={handleCourseCreated}
      />
    </>
  );
}

