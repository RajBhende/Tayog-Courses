import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getSession";
import { uploadAssignmentFile } from "@/lib/s3";
import { getS3FileUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    // Upload file to S3 in tayogcourses/assignment path
    const s3Key = await uploadAssignmentFile(file);
    const fileUrl = getS3FileUrl(s3Key);

    return NextResponse.json(
      {
        success: true,
        url: fileUrl,
        key: s3Key,
      },
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
