import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
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
        OR: [
          { teacherId: user.id },
          { coTeachers: { some: { id: user.id } } },
        ],
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coTeachers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Calculate performance for all students
    const studentPerformance = course.students.map((student: NonNullable<typeof course>['students'][number]) => {
            const studentSubmissions = course.assignments
            .flatMap((assignment: NonNullable<typeof course>['assignments'][number]) => assignment.submissions)
            .filter((submission: NonNullable<typeof course>['assignments'][number]['submissions'][number]) => submission.studentId === student.id);

      const gradedSubmissions = studentSubmissions.filter(
        (submission: NonNullable<typeof course>['assignments'][number]['submissions'][number]) => submission.feedback?.grade !== null && submission.feedback?.grade !== undefined
      );

      const totalGrade = gradedSubmissions.reduce(
        (sum: number, submission: NonNullable<typeof course>['assignments'][number]['submissions'][number]) => sum + (submission.feedback?.grade || 0),        0
      );

      const averageGrade =
        gradedSubmissions.length > 0
          ? Math.round(totalGrade / gradedSubmissions.length)
          : 0;

      const completedAssignments = studentSubmissions.length;
      const totalAssignments = course.assignments.length;

      // Determine status based on average grade
      let status: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Needs Improvement";
      if (averageGrade >= 90) {
        status = "Excellent";
      } else if (averageGrade >= 75) {
        status = "Good";
      } else if (averageGrade >= 60) {
        status = "Average";
      }

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        averageGrade,
        completedAssignments,
        totalAssignments,
        status,
      };
    });

    // Get all students for roster
    const roster = course.students.map((student: NonNullable<typeof course>['students'][number]) => ({      id: student.id,
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

    // Generate teacher code (using course name prefix + course ID)
    const teacherCode = `TEACH-${course.name.substring(0, 4).toUpperCase()}-${courseId.slice(0, 4).toUpperCase()}`;
    
    // Generate student course code (using course name prefix + course ID)
    const studentCode = `STUD-${course.name.substring(0, 4).toUpperCase()}-${courseId.slice(0, 4).toUpperCase()}`;

    // Get all team members (main teacher + co-teachers)
    const teamMembers = [
      {
        id: course.teacher.id,
        name: course.teacher.name,
        email: course.teacher.email,
        role: "Teacher",
      },
      ...course.coTeachers.map((coTeacher: NonNullable<typeof course>['coTeachers'][number]) => ({        id: coTeacher.id,
        name: coTeacher.name,
        email: coTeacher.email,
        role: "Co-Teacher",
      })),
    ];

    // Check if current user is the main teacher
    const isMainTeacher = course.teacherId === user.id;

    return NextResponse.json({
      success: true,
      studentPerformance,
      roster,
      shareableLink,
      teacherCode,
      studentCode,
      teamMembers,
      mainTeacher: course.teacher,
      coTeachers: course.coTeachers,
      isMainTeacher,
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
