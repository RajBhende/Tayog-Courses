"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCourseStore } from "@/lib/courseStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import type { Course } from "@/types";

interface StudentCourse extends Course {
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function StudentLobbyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { setSelectedCourse } = useCourseStore();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [studentCode, setStudentCode] = React.useState("");

  const { data: courses = [], isLoading } = useQuery<StudentCourse[]>({
    queryKey: ["student", "courses"],
    queryFn: async () => {
      const response = await api.get<Array<{ success: boolean; teacher?: { id: string; name: string; email: string } } & Course>>("/student/courses");
      return response.data.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        thumbnail: course.thumbnail,
        teacherId: course.teacherId,
        teacher: course.teacher,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      }));
    },
  });

  const joinCourseMutation = useMutation({
    mutationFn: async (code: string) => {
      // TODO: Implement join course API endpoint for students
      const response = await api.post("/student/courses/join", { code });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
      setStudentCode("");
    },
  });

  const handleCourseSelect = (course: StudentCourse) => {
    setSelectedCourseId(course.id);
    setSelectedCourse(course, "STUDENT");
    router.push("/student/dashboard");
  };

  const handleJoinCourse = () => {
    if (studentCode.trim()) {
      joinCourseMutation.mutate(studentCode.trim());
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    await signOut({ redirect: false });
    router.push("/");
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

  return (
    <>
      {/* Header Bar */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
            </div>
          </div>
          <span className="font-semibold text-lg">Tayog Courses</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-semibold">{userName}</span>
            <span className="text-sm text-gray-300">Student</span>
          </div>
          <Avatar className="bg-green-600">
            <AvatarFallback className="bg-green-600 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-800 rounded transition-colors"
            aria-label="Logout"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Dashboard Title and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Select a course to manage or view.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter Course Code"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinCourse();
                    }
                  }}
                  className="w-48"
                />
                <Button
                  onClick={handleJoinCourse}
                  disabled={!studentCode.trim() || joinCourseMutation.isPending}
                  variant="outline"
                  className="bg-gray-200 hover:bg-gray-300"
                >
                  {joinCourseMutation.isPending ? "Joining..." : "Join"}
                </Button>
              </div>
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
                  <h3 className="text-lg font-semibold">No courses available</h3>
                  <p className="text-sm text-gray-500">
                    You haven't been enrolled in any courses yet. Please contact your teacher or join a course using a code.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-xl overflow-hidden",
                    selectedCourseId === course.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  )}
                  onClick={() => handleCourseSelect(course)}
                >
                  {/* Gradient Top Section */}
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 relative">
                    <div className="absolute top-4 right-4">
                      <Shield className="h-5 w-5 text-white/80" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-lg line-clamp-1">
                        {course.name}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {course.name.substring(0, 4).toUpperCase()}-{course.id.slice(0, 3).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* White Bottom Section */}
                  <CardContent className="p-6 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-purple-600">
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {course.teacher?.name ? getUserInitials(course.teacher.name) : "T"}
                          </AvatarFallback>
                        </Avatar>
                        {course.teacher && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{course.teacher.name}</p>
                            <p className="text-xs text-gray-500">Teacher</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
