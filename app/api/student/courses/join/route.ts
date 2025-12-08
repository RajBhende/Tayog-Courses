import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { z } from "zod";

const joinCourseSchema = z.object({
  code: z.string().min(1, "Course code is required"),
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
    const validatedData = joinCourseSchema.parse(body);

    // Extract course ID from student code
    // Format: STUD-XXXX-YYYY where YYYY is first 4 chars of courseId
    const codeParts = validatedData.code.split("-");
    if (codeParts.length !== 3 || codeParts[0] !== "STUD") {
      return NextResponse.json(
        { success: false, error: "Invalid course code format" },
        { status: 400 }
      );
    }

    // Find course by matching the code pattern
    const allCourses = await prisma.course.findMany({
      include: {
        students: {
          select: {
            id: true,
          },
        },
      },
    });

    const matchedCourse = allCourses.find((course) => {
      const expectedCode = `STUD-${course.name.substring(0, 4).toUpperCase()}-${course.id.slice(0, 4).toUpperCase()}`;
      return expectedCode === validatedData.code;
    });

    if (!matchedCourse) {
      return NextResponse.json(
        { success: false, error: "Invalid course code" },
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = matchedCourse.students.some(
      (student) => student.id === user.id
    );

    if (isAlreadyEnrolled) {
      return NextResponse.json(
        { success: false, error: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    // Enroll student in the course
    await prisma.course.update({
      where: { id: matchedCourse.id },
      data: {
        students: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined the course",
        course: {
          id: matchedCourse.id,
          name: matchedCourse.name,
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
