"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Shield,
  Copy,
  UserPlus,
} from "lucide-react";
import { useCourseStore } from "@/lib/courseStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { AddCoTeacherDialog } from "@/components/teacher/AddCoTeacherDialog";
import { InviteCoTeacherDialog } from "@/components/teacher/InviteCoTeacherDialog";

interface StudentPerformance {
  id: string;
  name: string;
  email: string;
  averageGrade: number;
  completedAssignments: number;
  totalAssignments: number;
  status: "Excellent" | "Good" | "Average" | "Needs Improvement";
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Teacher" | "Co-Teacher";
}

interface PeopleData {
  success: boolean;
  studentPerformance: StudentPerformance[];
  roster: Student[];
  shareableLink: string;
  teacherCode: string;
  teamMembers: TeamMember[];
  mainTeacher: { id: string; name: string; email: string };
  coTeachers: Array<{ id: string; name: string; email: string }>;
  isMainTeacher?: boolean;
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

// Helper function to get status badge variant
function getStatusBadge(status: string) {
  switch (status) {
    case "Excellent":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Good":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "Average":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
}

export default function TeacherPeoplePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { selectedCourseId, selectedCourse } = useCourseStore();
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [addCoTeacherDialogOpen, setAddCoTeacherDialogOpen] = React.useState(false);
  const [inviteCoTeacherDialogOpen, setInviteCoTeacherDialogOpen] = React.useState(false);

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

  const { data, isLoading } = useQuery<PeopleData>({
    queryKey: ["teacher", "people", selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) {
        throw new Error("Course ID is required");
      }
      const response = await api.get<PeopleData>(
        `/teacher/people?courseId=${selectedCourseId}`
      );
      return response.data;
    },
    enabled: !!selectedCourseId,
  });

  // Check if current user is the main teacher
  const isMainTeacher = React.useMemo(() => {
    return data?.isMainTeacher ?? data?.mainTeacher?.id === session?.user?.id;
  }, [data?.isMainTeacher, data?.mainTeacher?.id, session?.user?.id]);

  const handleCopyLink = async () => {
    if (data?.shareableLink) {
      try {
        await navigator.clipboard.writeText(data.shareableLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        alert("Failed to copy link to clipboard.");
      }
    }
  };

  const handleCopyCode = async () => {
    if (data?.teacherCode) {
      try {
        await navigator.clipboard.writeText(data.teacherCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        alert("Failed to copy code to clipboard.");
      }
    }
  };

  React.useEffect(() => {
    if (!selectedCourseId || !selectedCourse) {
      router.replace("/teacher/lobby");
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

  // Don't render if not authenticated or not a teacher
  if (status === "unauthenticated" || session?.user?.role !== "TEACHER") {
    return null;
  }

  if (!selectedCourseId || !selectedCourse) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            People & Performance
          </h1>
        </div>
        {/* Team Avatars */}
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>
        ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">TEAM</span>
          <div className="flex -space-x-2">
              {data?.teamMembers?.slice(0, 3).map((member) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-white"
                  title={member.name}
                >
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
              {data?.teamMembers && data.teamMembers.length > 3 && (
                <Avatar className="h-8 w-8 border-2 border-white bg-gray-200">
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    +{data.teamMembers.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
          </div>
        </div>
        )}
      </div>

      {/* Invitation Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Invite Students Card */}
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
              <Skeleton className="h-10 w-full" />
            ) : (
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full bg-gray-100 hover:bg-gray-200"
                disabled={!data?.shareableLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copiedLink ? "Copied!" : "Copy Shareable Link"}
            </Button>
            )}
          </CardContent>
        </Card>

        {/* Invite Co-Teachers Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle>Invite Co-Teachers</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share secret code for admin access
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            ) : (
            <div className="flex items-center gap-2">
              <Input
                  value={data?.teacherCode ?? ""}
                readOnly
                className="bg-white border-purple-300 font-mono"
              />
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="bg-purple-100 hover:bg-purple-200 border-purple-300"
                  disabled={!data?.teacherCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Class Performance</h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Avg. Grade</TableHead>
                  <TableHead>Assignments Completed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : data?.studentPerformance && data.studentPerformance.length > 0 ? (
                  data.studentPerformance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            className={`h-10 w-10 ${getAvatarColor(student.name)}`}
                          >
                            <AvatarFallback
                              className={`${getAvatarColor(student.name)} text-white`}
                            >
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {student.averageGrade}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {student.completedAssignments}/{student.totalAssignments}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadge(student.status)}
                          variant="outline"
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No student performance data available yet.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Team Members</h2>
          <div className="flex gap-2">
            {isMainTeacher ? (
              <Button
                variant="outline"
                onClick={() => setInviteCoTeacherDialogOpen(true)}
                className="bg-purple-50 hover:bg-purple-100 border-purple-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Co-Teacher
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setAddCoTeacherDialogOpen(true)}
                className="bg-purple-50 hover:bg-purple-100 border-purple-200"
              >
                <Shield className="h-4 w-4 mr-2" />
                Join as Co-Teacher
              </Button>
            )}
          </div>
        </div>
        <InviteCoTeacherDialog
          open={inviteCoTeacherDialogOpen}
          onOpenChange={setInviteCoTeacherDialogOpen}
        />
        <AddCoTeacherDialog
          open={addCoTeacherDialogOpen}
          onOpenChange={setAddCoTeacherDialogOpen}
        />
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => (
              <Card key={i}>
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
            ))}
          </div>
        ) : data?.teamMembers && data.teamMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.teamMembers.map((member) => (
              <Card
                key={member.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  member.role === "Teacher" ? "border-l-4 border-l-purple-500" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Avatar
                      className={`h-12 w-12 ${getAvatarColor(member.name)}`}
                    >
                      <AvatarFallback
                        className={`${getAvatarColor(member.name)} text-white`}
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No team members yet.</p>
        )}
      </div>

    </div>
  );
}
