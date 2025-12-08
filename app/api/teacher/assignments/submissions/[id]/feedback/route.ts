import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { z } from "zod";

const submitFeedbackSchema = z.object({
  comment: z.string().min(1, "Feedback comment is required"),
  grade: z.number().min(0).max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: submissionId } = await params;
    const body = await request.json();
    const validatedData = submitFeedbackSchema.parse(body);

    // Check if submission exists and get assignment to verify teacher access
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                teacherId: true,
                coTeachers: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    // Check if teacher has access to this course
    const hasAccess =
      submission.assignment.course.teacherId === user.id ||
      submission.assignment.course.coTeachers.some(
        (ct: { id: string }) => ct.id === user.id
      );

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { submissionId: submission.id },
    });

    let feedback;
    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.feedback.update({
        where: { id: existingFeedback.id },
        data: {
          comment: validatedData.comment,
          grade: validatedData.grade ?? null,
          teacherId: user.id,
        },
      });
    } else {
      // Create new feedback
      feedback = await prisma.feedback.create({
        data: {
          comment: validatedData.comment,
          grade: validatedData.grade ?? null,
          submissionId: submission.id,
          teacherId: user.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        feedback: {
          id: feedback.id,
          comment: feedback.comment,
          grade: feedback.grade,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

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
