import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { enrollStudentSchema } from "@/validation";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let course = await prisma.course.findFirst({
      where: { teacherId: user.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
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

    const students = course.students.map((student, index) => ({
      success: true,
      id: student.id,
      studentId: `#${String(index + 1).padStart(3, "0")}`,
      name: student.name,
      initials: student.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      email: student.email,
    }));

    return NextResponse.json(students);
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
    const validatedData = enrollStudentSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    let studentUser;
    if (existingUser) {
      if (existingUser.role !== "STUDENT") {
        return NextResponse.json(
          {
            error: "User with this email already exists with a different role",
          },
          { status: 400 }
        );
      }
      studentUser = existingUser;
    } else {
      const hashedPassword = await bcrypt.hash("tempPassword123!", 10);
      studentUser = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.fullName,
          role: "STUDENT",
        },
      });
    }

    let course = await prisma.course.findFirst({
      where: { teacherId: user.id },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const isAlreadyEnrolled = await prisma.course.findFirst({
      where: {
        id: course.id,
        students: {
          some: { id: studentUser.id },
        },
      },
    });

    if (isAlreadyEnrolled) {
      return NextResponse.json(
        { success: false, error: "Student is already enrolled in this course" },
        { status: 400 }
      );
    }

    await prisma.course.update({
      where: { id: course.id },
      data: {
        students: {
          connect: { id: studentUser.id },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: studentUser.id,
        name: studentUser.name,
        email: studentUser.email,
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
