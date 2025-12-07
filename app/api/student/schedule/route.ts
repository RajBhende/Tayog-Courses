import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
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
        students: {
          some: { id: user.id },
        },
      },
      include: {
        scheduledClasses: {
          orderBy: { time: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    const schedules = course.scheduledClasses.map((schedule: NonNullable<typeof course>['scheduledClasses'][number]) => ({      success: true,
      id: schedule.id,
      subject: schedule.subject,
      topic: schedule.topic,
      time: schedule.time.toISOString(),
      meetingLink: schedule.meetingLink,
    }));

    return NextResponse.json(schedules);
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
