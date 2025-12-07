import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { z } from "zod";

const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, "Assignment ID is required"),
  summary: z.string().optional(),
  fileUrl: z.string().optional(),
}).refine((data) => data.summary || data.fileUrl, {
  message: "Either summary or file must be provided",
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = submitAssignmentSchema.parse(body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: validatedData.assignmentId },
      include: {
        course: {
          include: {
            students: {
              where: { id: user.id },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.course.students.length === 0) {
      return NextResponse.json(
        { success: false, error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: validatedData.assignmentId,
        studentId: user.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: "You have already submitted this assignment" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        summary: validatedData.summary ?? "",
        fileUrl: validatedData.fileUrl ?? null,
        assignmentId: validatedData.assignmentId,
        studentId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: submission.id,
        summary: submission.summary,
        fileUrl: submission.fileUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.message,
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

