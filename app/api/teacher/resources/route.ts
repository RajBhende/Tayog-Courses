import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { uploadResourceSchema } from "@/validation";
import { uploadFile } from "@/lib/s3";
import { getS3FileUrl } from "@/lib/utils";

// Configure API route to accept larger file uploads (up to 200MB)
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large file uploads

const RESOURCE_TYPE_MAP: Record<
  string,
  "PDF_DOCUMENT" | "VIDEO_CLASS" | "IMAGE"
> = {
  "Note / PDF": "PDF_DOCUMENT",
  "Video Class": "VIDEO_CLASS",
  Image: "IMAGE",
};

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
        teacherId: user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const resources = await prisma.resources.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        type: resource.type,
        attachment: resource.attachment
          ? getS3FileUrl(resource.attachment)
          : "",
        courseId: resource.courseId,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
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

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const file = formData.get("file") as File | null;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: "Title and type are required" },
        { status: 400 }
      );
    }

    const resourceType = RESOURCE_TYPE_MAP[type];
    if (!resourceType) {
      return NextResponse.json(
        { success: false, error: "Invalid resource type" },
        { status: 400 }
      );
    }

    const courseId = formData.get("courseId") as string | null;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    let attachmentKey = "";
    if (file) {
      try {
        // Upload file to S3
        attachmentKey = await uploadFile(file);
      } catch (error) {
        console.error("Error uploading file to S3:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to upload file to S3",
          },
          { status: 500 }
        );
      }
    }

    const resource = await prisma.resources.create({
      data: {
        title,
        type: resourceType,
        attachment: attachmentKey,
        courseId: course.id,
      },
    });

    return NextResponse.json(
      {
        id: resource.id,
        title: resource.title,
        type: resource.type,
        attachment: attachmentKey ? getS3FileUrl(attachmentKey) : "",
        courseId: resource.courseId,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
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
