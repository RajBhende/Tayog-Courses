"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, Copy } from "lucide-react";
import { useCourseStore } from "@/lib/courseStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface TopPerformer {
  rank: number;
  id: string;
  name: string;
  averageGrade: number;
  percentage: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface PeopleData {
  success: boolean;
  currentStudentAverage: number;
  topPerformers: TopPerformer[];
  roster: Student[];
  teacher: Teacher;
  shareableLink: string;
}

// Helper function to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper function to get avatar color based on name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-blue-600",
    "bg-purple-600",
    "bg-green-600",
    "bg-teal-600",
    "bg-pink-600",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Helper function to get rank color
function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-orange-100 text-orange-600";
    case 2:
      return "bg-blue-100 text-blue-600";
    case 3:
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function StudentPeoplePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { selectedCourseId, selectedCourse } = useCourseStore();
  const [copied, setCopied] = React.useState(false);

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

  const { data, isLoading } = useQuery<PeopleData>({
    queryKey: ["student", "people", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const response = await api.get<PeopleData>(
        `/student/people?courseId=${selectedCourseId}`
      );
      return response.data;
    },
    enabled: !!selectedCourseId,
  });

  const handleCopyLink = async () => {
    if (data?.shareableLink) {
      try {
        await navigator.clipboard.writeText(data.shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        alert("Failed to copy link to clipboard.");
      }
    }
  };

  React.useEffect(() => {
    if (!selectedCourseId || !selectedCourse) {
      router.replace("/student/lobby");
    }
  }, [selectedCourseId, selectedCourse, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          People & Performance
        </h1>
      </div>

      {/* Invite Students Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600" />
            <CardTitle>Invite Students</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share link to enroll students
          </p>
          {isLoading ? (
            <Skeleton className="h-10 w-full sm:w-48" />
          ) : (
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200"
              disabled={!data?.shareableLink}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Shareable Link"}
          </Button>
          )}
        </CardContent>
      </Card>

      {/* Class Teacher Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Class Teacher</h2>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : data?.teacher ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    className={`h-12 w-12 ${getAvatarColor(data.teacher.name)}`}
                  >
                    <AvatarFallback
                      className={`${getAvatarColor(data.teacher.name)} text-white`}
                    >
                      {getInitials(data.teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{data.teacher.name}</p>
                    <p className="text-sm text-muted-foreground">Teacher</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

    </div>
  );
}
