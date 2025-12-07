"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, Link2, Copy, Trophy, BarChart3 } from "lucide-react";
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

interface PeopleData {
  success: boolean;
  currentStudentAverage: number;
  topPerformers: TopPerformer[];
  roster: Student[];
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
  const { selectedCourseId, selectedCourse } = useCourseStore();
  const [copied, setCopied] = React.useState(false);

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

  if (!selectedCourseId || !selectedCourse) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
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
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy Shareable Link"}
          </Button>
        </CardContent>
      </Card>

      {/* My Progress & Top Performers Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">My Progress & Top Performers</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* My Current Standing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                My Current Standing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {data.currentStudentAverage}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    / 100 avg
                  </span>
                </div>
                <Progress value={data.currentStudentAverage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Class Top Performers Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <CardTitle>Class Top Performers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hardcoded top 3 performers - will be replaced with backend data later */}
              {[
                { rank: 1, name: "Hermione Granger", percentage: 99, id: "1" },
                { rank: 2, name: "Draco Malfoy", percentage: 94, id: "2" },
                { rank: 3, name: "Harry Potter", percentage: 85, id: "3" },
              ].map((performer) => (
                <div
                  key={performer.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${getRankColor(
                      performer.rank
                    )}`}
                  >
                    {performer.rank}
                  </div>
                  <Avatar
                    className={`h-10 w-10 ${getAvatarColor(performer.name)}`}
                  >
                    <AvatarFallback
                      className={`${getAvatarColor(performer.name)} text-white`}
                    >
                      {getInitials(performer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{performer.name}</p>
                  </div>
                  <div className="text-sm font-semibold">
                    {performer.percentage}%
                  </div>
                </div>
              ))}
              <p className="text-xs text-center text-muted-foreground pt-2">
                Only top 3 students are visible to class.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Class Co-Teacher Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Class Co-Teacher</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.roster.map((student) => (
            <Card
              key={student.id}
              className="cursor-pointer transition-all hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    className={`h-12 w-12 ${getAvatarColor(student.name)}`}
                  >
                    <AvatarFallback
                      className={`${getAvatarColor(student.name)} text-white`}
                    >
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
