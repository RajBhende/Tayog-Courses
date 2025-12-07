import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";

export async function DELETE(
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

    const { id: studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 }
      );
    }

    let course = await prisma.course.findFirst({
      where: { teacherId: user.id },
      include: {
        students: {
          where: { id: studentId },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const student = course.students.find((s) => s.id === studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found in this course" },
        { status: 404 }
      );
    }

    await prisma.course.update({
      where: { id: course.id },
      data: {
        students: {
          disconnect: { id: studentId },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Student removed successfully" },
      { status: 200 }
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

