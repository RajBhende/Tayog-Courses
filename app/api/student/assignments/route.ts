import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { getS3FileUrl } from "@/lib/utils";

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
        assignments: {
          include: {
            submissions: {
              where: { studentId: user.id },
              include: {
                feedback: true,
              },
            },
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    const courseAssignments = course.assignments;
    const assignments = courseAssignments.map((assignment: NonNullable<typeof course>['assignments'][number]) => {            const submission = assignment.submissions[0];
      const hasSubmission = !!submission;
      const hasFeedback = !!submission?.feedback;

      let status: "pending" | "submitted" | "graded" = "pending";
      if (hasFeedback) {
        status = "graded";
      } else if (hasSubmission) {
        status = "submitted";
      }

      return {
        success: true,
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString(),
        attachment: assignment.attachment
          ? assignment.attachment.startsWith("http")
            ? assignment.attachment
            : getS3FileUrl(assignment.attachment)
          : null,
        status,
        submission: submission?.summary || null,
        submittedFile: submission?.fileUrl
          ? submission.fileUrl.startsWith("http")
            ? submission.fileUrl
            : getS3FileUrl(submission.fileUrl)
          : null,
        feedback: submission?.feedback?.comment || null,
        grade: submission?.feedback?.grade
          ? `${submission.feedback.grade}/100`
          : null,
      };
    });

    return NextResponse.json(assignments);
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
