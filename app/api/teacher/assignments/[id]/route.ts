import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { getS3FileUrl } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            teacherId: true,
            coTeachers: {
              select: { id: true },
            },
          },
        },
        _count: {
          select: { submissions: true },
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            feedback: {
              select: {
                comment: true,
                grade: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this course (main teacher or co-teacher)
    const hasAccess =
      assignment.course.teacherId === user.id ||
      assignment.course.coTeachers.some((ct) => ct.id === user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString(),
      attachment: assignment.attachment,
      submissions: assignment._count.submissions,
      studentSubmissions: assignment.submissions.map((submission) => ({
        id: submission.id,
        studentId: submission.student.id,
        studentName: submission.student.name || "Unknown",
        studentEmail: submission.student.email || "",
        submission: submission.summary,
        submittedFile: submission.fileUrl
          ? submission.fileUrl.startsWith("http")
            ? submission.fileUrl
            : getS3FileUrl(submission.fileUrl)
          : undefined,
        grade: submission.feedback?.grade
          ? `${submission.feedback.grade}/100`
          : undefined,
        feedback: submission.feedback?.comment || undefined,
        submittedAt: submission.createdAt.toISOString(),
      })),
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
