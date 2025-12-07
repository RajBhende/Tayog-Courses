import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: { id: user.id },
        },
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignments: {
          include: {
            submissions: {
              include: {
                feedback: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    // Calculate performance for all students
    const studentPerformance = course.students.map((student) => {
      const studentSubmissions = course.assignments
        .flatMap((assignment) => assignment.submissions)
        .filter((submission) => submission.studentId === student.id);

      const gradedSubmissions = studentSubmissions.filter(
        (submission) => submission.feedback?.grade !== null && submission.feedback?.grade !== undefined
      );

      const totalGrade = gradedSubmissions.reduce(
        (sum, submission) => sum + (submission.feedback?.grade || 0),
        0
      );

      const averageGrade =
        gradedSubmissions.length > 0
          ? Math.round(totalGrade / gradedSubmissions.length)
          : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        averageGrade,
        gradedCount: gradedSubmissions.length,
        totalAssignments: course.assignments.length,
      };
    });

    // Get current student's performance
    const currentStudent = studentPerformance.find((s) => s.id === user.id);
    const currentStudentAverage = currentStudent?.averageGrade || 0;

    // Get top 3 performers (excluding current student, then add current student if in top 3)
    const topPerformers = studentPerformance
      .filter((s) => s.gradedCount > 0)
      .sort((a, b) => b.averageGrade - a.averageGrade)
      .slice(0, 3)
      .map((student, index) => ({
        rank: index + 1,
        id: student.id,
        name: student.name,
        averageGrade: student.averageGrade,
        percentage: student.averageGrade,
      }));

    // Get all students for roster
    const roster = course.students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
    }));

    // Construct shareable link using request origin
    const origin = request.headers.get("origin") || request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = origin
      ? `${protocol}://${origin}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareableLink = `${baseUrl}/student/enroll?courseId=${courseId}`;

    return NextResponse.json({
      success: true,
      currentStudentAverage,
      topPerformers,
      roster,
      shareableLink,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
