import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { z } from "zod";

const addCoTeacherSchema = z.object({
  teacherCode: z.string().min(1, "Teacher code is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

const inviteCoTeacherSchema = z.object({
  email: z.string().email("Invalid email address"),
  courseId: z.string().min(1, "Course ID is required"),
});

// PUT - Invite co-teacher by email (main teacher only)
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

    // Check if user is the main teacher of the course
    const course = await prisma.course.findFirst({
      where: {
        id: validatedData.courseId,
        teacherId: user.id,
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
      (ct) => ct.id === teacherToInvite.id
    );

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

// POST - Add co-teacher using teacher code (self-join)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addCoTeacherSchema.parse(body);

    // Extract course ID from teacher code
    // Format: TEACH-XXXX-YYYY where YYYY is first 4 chars of courseId
    const codeParts = validatedData.teacherCode.split("-");
    if (codeParts.length !== 3 || codeParts[0] !== "TEACH") {
      return NextResponse.json(
        { success: false, error: "Invalid teacher code format" },
        { status: 400 }
      );
    }

    // Find course by matching the code pattern
    // We'll search for courses and match the generated code
    const allCourses = await prisma.course.findMany({
      include: {
        teacher: true,
        coTeachers: true,
      },
    });

    const matchedCourse = allCourses.find((course) => {
      const expectedCode = `TEACH-${course.name.substring(0, 4).toUpperCase()}-${course.id.slice(0, 4).toUpperCase()}`;
      return expectedCode === validatedData.teacherCode;
    });

    if (!matchedCourse) {
      return NextResponse.json(
        { success: false, error: "Invalid teacher code" },
        { status: 404 }
      );
    }

    // Check if user is already a co-teacher
    const isAlreadyCoTeacher = matchedCourse.coTeachers?.some(
      (ct: { id: string }) => ct.id === user.id
    ) || false;

    if (isAlreadyCoTeacher) {
      return NextResponse.json(
        { success: false, error: "You are already a co-teacher of this course" },
        { status: 400 }
      );
    }

    // Check if user is the main teacher
    if (matchedCourse.teacherId === user.id) {
      return NextResponse.json(
        { success: false, error: "You are already the main teacher of this course" },
        { status: 400 }
      );
    }

    // Add user as co-teacher
    await prisma.course.update({
      where: { id: matchedCourse.id },
      data: {
        coTeachers: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully added as co-teacher",
      course: {
        id: matchedCourse.id,
        name: matchedCourse.name,
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

    // Check if user is the main teacher of the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: user.id,
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

