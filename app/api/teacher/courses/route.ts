import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { createCourseSchema } from "@/validation/courses";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get courses where user is main teacher OR co-teacher
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { teacherId: user.id },
          { coTeachers: { some: { id: user.id } } },
        ],
      },
      include: {
        _count: {
          select: { students: true },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 3, // Only get first 3 students for avatar display
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      courses.map((course: (typeof courses)[number]) => ({        success: true,
        id: course.id,
        name: course.name,
        description: course.description,
        thumbnail: course.thumbnail,
        teacherId: course.teacherId,
        studentCount: course._count.students,
        students: course.students.map((student: (typeof course.students)[number]) => ({
          id: student.id,
          name: student.name,
          email: student.email,
        })),
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        thumbnail: validatedData.thumbnail || null,
        teacherId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: course.id,
        name: course.name,
        description: course.description,
        thumbnail: course.thumbnail,
        teacherId: course.teacherId,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
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
