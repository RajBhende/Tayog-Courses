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
  Copy,
  UserPlus,
  Trash2,
} from "lucide-react";
import { useCourseStore } from "@/lib/courseStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { InviteCoTeacherDialog } from "@/components/teacher/InviteCoTeacherDialog";
import { EnrollStudentDialog } from "@/components/teacher/EnrollStudentDialog";
import { useStudents } from "@/hooks/teacher/students/useStudents";
import { useRemoveStudent } from "@/hooks/teacher/students/useRemoveStudent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Student } from "@/types";

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
  studentCode?: string;
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
  const [copiedStudentCode, setCopiedStudentCode] = React.useState(false);
  const [inviteCoTeacherDialogOpen, setInviteCoTeacherDialogOpen] = React.useState(false);
  const [enrollStudentDialogOpen, setEnrollStudentDialogOpen] = React.useState(false);
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const removeStudent = useRemoveStudent();

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

  const handleCopyStudentCode = async () => {
    if (data?.studentCode) {
      try {
        await navigator.clipboard.writeText(data.studentCode);
        setCopiedStudentCode(true);
        setTimeout(() => setCopiedStudentCode(false), 2000);
      } catch (error) {
        alert("Failed to copy student code to clipboard.");
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
              Share link or course code to enroll students
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            ) : (
              data?.studentCode && (
                <div className="flex items-center gap-2">
                  <Input
                    value={data.studentCode}
                    readOnly
                    className="bg-white border-blue-300 font-mono text-sm"
                    placeholder="Student Course Code"
                  />
                  <Button
                    onClick={handleCopyStudentCode}
                    variant="outline"
                    className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                    disabled={!data.studentCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>

      </div>

      {/* Student Directory Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Directory</h2>
            <p className="text-muted-foreground mt-1">
              Manage enrollment and class roster
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setEnrollStudentDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Enroll New Student
          </Button>
        </div>

        <EnrollStudentDialog
          open={enrollStudentDialogOpen}
          onOpenChange={setEnrollStudentDialogOpen}
        />

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingStudents ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-9 w-9 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.studentId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {student.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {student.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {student.name} from
                                this course? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeStudent.mutate(student.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={removeStudent.isPending}
                              >
                                {removeStudent.isPending
                                  ? "Removing..."
                                  : "Remove Student"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
            <Button
              variant="outline"
              onClick={() => setInviteCoTeacherDialogOpen(true)}
              className="bg-purple-50 hover:bg-purple-100 border-purple-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Co-Teacher
            </Button>
          </div>
        </div>
        <InviteCoTeacherDialog
          open={inviteCoTeacherDialogOpen}
          onOpenChange={setInviteCoTeacherDialogOpen}
        />
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
        {isLoading ? (
                  <>
            {[1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell>
                  <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                    </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                      </TableRow>
            ))}
                  </>
        ) : data?.teamMembers && data.teamMembers.length > 0 ? (
                  data.teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                            className={`h-10 w-10 ${getAvatarColor(member.name)}`}
                    >
                      <AvatarFallback
                        className={`${getAvatarColor(member.name)} text-white`}
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {member.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            member.role === "Teacher"
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          }
                          variant="outline"
                        >
                        {member.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No team members yet.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
                </CardContent>
              </Card>
      </div>

    </div>
  );
}
