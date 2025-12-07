import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getSession";
import { DeleteFiles } from "@/lib/s3";
import { extractKeyFromUrl } from "@/lib/utils";

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

    const { id: resourceId } = await params;

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: "Resource ID is required" },
        { status: 400 }
      );
    }

    // Find the resource and verify ownership (main teacher or co-teacher)
    const resource = await prisma.resources.findFirst({
      where: {
        id: resourceId,
        course: {
          OR: [
            { teacherId: user.id },
            { coTeachers: { some: { id: user.id } } },
          ],
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 }
      );
    }

    // Delete file from S3 if attachment exists
    if (resource.attachment) {
      try {
        // 1. URL मधून S3 key extract करणे
        // resource.attachment can be either a key or a full URL
        let key: string | null = null;
        
        if (resource.attachment.startsWith("http://") || resource.attachment.startsWith("https://")) {
          // Full URL - extract key
          key = extractKeyFromUrl(resource.attachment);
        } else {
          // Already a key
          key = resource.attachment;
        }
        
        // 2. S3 मधून जुनी file delete करणे
        if (key) {
          await DeleteFiles(key); // ✅ S3 मधून delete
          console.log(`Deleted file from S3: ${key}`);
        }
      } catch (error) {
        console.warn("Delete failed:", error);
        // Continue anyway - don't block the operation
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete resource from database
    await prisma.resources.delete({
      where: { id: resourceId },
    });

    return NextResponse.json(
      { success: true, message: "Resource deleted successfully" },
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

