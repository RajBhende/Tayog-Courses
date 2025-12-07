import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { createAssignmentSchema } from "@/validation/assignments";
import { getS3FileUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const assignments = await prisma.assignment.findMany({
      where: { courseId: course.id },
      include: {
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      assignments.map((assignment) => ({
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
      }))
    );
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAssignmentSchema.parse(body);

    const courseId =
      body.courseId || new URL(request.url).searchParams.get("courseId");

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
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        dueDate: new Date(validatedData.dueDate),
        attachment: body.attachment || null,
        courseId: course.id,
      },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate.toISOString(),
        attachment: assignment.attachment,
        submissions: assignment._count.submissions,
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
