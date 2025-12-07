import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { scheduleClassSchema } from "@/validation/schedule";

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

    // Get schedules for this course (created by any teacher with access to the course)
    const schedules = await prisma.scheduleClasses.findMany({
      where: {
        courseId: course.id,
      },
      orderBy: { time: "asc" },
    });

    return NextResponse.json(
      schedules.map((schedule) => ({
        success: true,
        id: schedule.id,
        subject: schedule.subject,
        topic: schedule.topic,
        time: schedule.time.toISOString(),
        meetingLink: schedule.meetingLink,
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
    const validatedData = scheduleClassSchema.parse(body);

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

    const [datePart, timePart] = validatedData.time.split(" ");
    const [hours, minutes] = timePart.split(":");
    const scheduleDate = new Date(datePart);
    scheduleDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const schedule = await prisma.scheduleClasses.create({
      data: {
        subject: validatedData.subject,
        topic: validatedData.topic,
        time: scheduleDate,
        meetingLink: validatedData.meetingLink,
        courseId: course.id,
        teacherId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: schedule.id,
        subject: schedule.subject,
        topic: schedule.topic,
        time: schedule.time.toISOString(),
        meetingLink: schedule.meetingLink,
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
