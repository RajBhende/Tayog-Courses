import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { getS3FileUrl } from "@/lib/utils";

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
        resources: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or access denied" },
        { status: 404 }
      );
    }

    const resources = course.resources.map((resource) => ({
      success: true,
      id: resource.id,
      title: resource.title,
      type: resource.type,
      attachment: resource.attachment
        ? getS3FileUrl(resource.attachment)
        : null,
      createdAt: resource.createdAt.toISOString(),
    }));

    return NextResponse.json(resources);
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
