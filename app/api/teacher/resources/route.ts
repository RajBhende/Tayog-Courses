import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { uploadResourceSchema } from "@/validation";

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

    let course = await prisma.course.findFirst({
      where: { teacherId: user.id },
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
        success: true,
        id: resource.id,
        title: resource.title,
        type: resource.type,
        attachment: resource.attachment,
        createdAt: resource.createdAt.toISOString(),
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

    let course = await prisma.course.findFirst({
      where: { teacherId: user.id },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    let attachmentUrl = "";
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      attachmentUrl = `/uploads/${fileName}`;
    }

    const resource = await prisma.resources.create({
      data: {
        title,
        type: resourceType,
        attachment: attachmentUrl,
        courseId: course.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: resource.id,
        title: resource.title,
        type: resource.type,
        attachment: resource.attachment,
        createdAt: resource.createdAt.toISOString(),
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
