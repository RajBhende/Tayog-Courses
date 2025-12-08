import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { z } from "zod";

const inviteCoTeacherSchema = z.object({
  email: z.string().email("Invalid email address"),
  courseId: z.string().min(1, "Course ID is required"),
});

// PUT - Invite co-teacher by email (main teacher or co-teacher)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = inviteCoTeacherSchema.parse(body);

    // Check if user is the main teacher or co-teacher of the course
    const course = await prisma.course.findFirst({
      where: {
        id: validatedData.courseId,
        OR: [
          { teacherId: user.id },
          { coTeachers: { some: { id: user.id } } },
        ],
      },
      include: {
        coTeachers: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Find the teacher by email
    const teacherToInvite = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!teacherToInvite) {
      return NextResponse.json(
        { success: false, error: "Teacher with this email not found" },
        { status: 404 }
      );
    }

    if (teacherToInvite.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "User with this email is not a teacher" },
        { status: 400 }
      );
    }

    // Check if teacher is already the main teacher
    if (course.teacherId === teacherToInvite.id) {
      return NextResponse.json(
        { success: false, error: "This teacher is already the main teacher of the course" },
        { status: 400 }
      );
    }

    // Check if teacher is already a co-teacher
    const isAlreadyCoTeacher = course.coTeachers?.some(
      (ct: NonNullable<typeof course>['coTeachers'][number]) => ct.id === teacherToInvite.id    );

    if (isAlreadyCoTeacher) {
      return NextResponse.json(
        { success: false, error: "This teacher is already a co-teacher of this course" },
        { status: 400 }
      );
    }

    // Add teacher as co-teacher
    await prisma.course.update({
      where: { id: course.id },
      data: {
        coTeachers: {
          connect: { id: teacherToInvite.id },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully invited ${teacherToInvite.name} as co-teacher`,
      coTeacher: {
        id: teacherToInvite.id,
        name: teacherToInvite.name,
        email: teacherToInvite.email,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
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

// DELETE - Remove co-teacher
export async function DELETE(request: NextRequest) {
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
    const coTeacherId = searchParams.get("coTeacherId");

    if (!courseId || !coTeacherId) {
      return NextResponse.json(
        { success: false, error: "Course ID and Co-Teacher ID are required" },
        { status: 400 }
      );
    }

    // Check if user is the main teacher or co-teacher of the course
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
        { success: false, error: "Course not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Remove co-teacher
    await prisma.course.update({
      where: { id: courseId },
      data: {
        coTeachers: {
          disconnect: { id: coTeacherId },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Co-teacher removed successfully",
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

