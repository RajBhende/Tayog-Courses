"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { extractKeyFromUrl } from "@/lib/utils";

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Generate unique file name
const generateUniqueFileName = (): string => {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[-:.]/g, "");
  const uid = uuidv4();
  return `${uid}-${timestamp}`;
};

// Get file extension from MIME type or file name
const getFileExtension = (fileType: string, fileName?: string): string => {
  // Try to get extension from MIME type first
  const mimeToExt: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "video/webm": "webm",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };

  if (mimeToExt[fileType]) {
    return mimeToExt[fileType];
  }

  // Fallback to file name extension
  if (fileName) {
    const parts = fileName.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  }

  // Default fallback
  return "bin";
};

/**
 * Upload file to S3
 * @param file - File buffer
 * @param fileType - MIME type of the file
 * @param fileName - Original file name (optional)
 * @returns S3 key (path) of the uploaded file
 */
export const uploadFileToS3 = async (
  file: Buffer,
  fileType: string,
  fileName?: string
): Promise<string> => {
  const uniqueFileName = generateUniqueFileName();
  const extension = getFileExtension(fileType, fileName);
  const key = `tayogcourses/resources/${uniqueFileName}.${extension}`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in",
    Key: key,
    Body: file,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

/**
 * Delete file from S3
 * @param key - S3 key (path) of the file to delete
 */
export const DeleteFiles = async (key: string): Promise<void> => {
  const params = {
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in",
    Key: key, // S3 मधील file path (key)
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command); // S3 मधून file delete होते
  } catch (error) {
    throw error;
  }
};

/**
 * Delete file from S3 (alias for DeleteFiles)
 * @param key - S3 key (path) of the file to delete
 */
export const deleteFileFromS3 = DeleteFiles;

/**
 * Upload file from File object to S3
 * @param file - File object
 * @returns S3 key (path) of the uploaded file
 */
export const uploadFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadFileToS3(buffer, file.type, file.name);
};

/**
 * Upload PDF to S3 with custom filename
 * @param buffer - PDF file buffer
 * @param fileName - Custom file name (without extension)
 * @param folder - Folder path in S3 (default: "tayogcourses/resources")
 * @returns S3 key (path) of the uploaded file
 */
export const uploadPdfToS3 = async (
  buffer: Buffer,
  fileName: string,
  folder: string = "tayogcourses/resources"
): Promise<string> => {
  // Ensure fileName has .pdf extension
  const pdfFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  const key = `${folder}/${pdfFileName}`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in",
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error("Error uploading PDF to S3:", error);
    throw error;
  }
};

/**
 * Remove old file and upload new file
 * @param file - New file to upload
 * @param previousKey - Previous S3 key to delete (can be key or URL)
 * @param folder - Folder path in S3 (default: "tayogcourses/resources")
 * @returns S3 key (path) of the newly uploaded file
 */
export const RemoveUploadFile = async (
  file: File,
  previousKey: string | null,
  folder: string = "tayogcourses/resources"
): Promise<string> => {
  try {
    // Delete previous file if exists
    if (previousKey) {
      let keyToDelete: string | null = null;

      // Check if previousKey is a URL or a key
      if (previousKey.startsWith("http://") || previousKey.startsWith("https://")) {
        keyToDelete = extractKeyFromUrl(previousKey);
      } else {
        keyToDelete = previousKey;
      }

      if (keyToDelete) {
        try {
          await DeleteFiles(keyToDelete); // ✅ S3 मधून delete
          console.log(`Deleted previous file: ${keyToDelete}`);
        } catch (error) {
          console.warn("Delete failed:", error);
          // Continue anyway - don't block the operation
          // Continue with upload even if delete fails
        }
      }
    }

    // Upload new file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uniqueFileName = generateUniqueFileName();
    const extension = getFileExtension(file.type, file.name);
    const key = `${folder}/${uniqueFileName}.${extension}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in",
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return key;
  } catch (error) {
    console.error("Error in RemoveUploadFile:", error);
    throw error;
  }
};

/**
 * Update profile picture in S3
 * Deletes old profile picture and uploads new one
 * @param file - New profile picture file
 * @param previousProfilePicUrl - Previous profile picture URL or key
 * @param folder - Folder path in S3 (default: "profile")
 * @returns S3 key (path) of the newly uploaded profile picture, or null on error
 */
export const UpdateProfilePictureInS3 = async (
  file: File,
  previousProfilePicUrl: string | null,
  folder: string = "profile"
): Promise<string | null> => {
  try {
    // Delete previous profile picture if exists
    if (previousProfilePicUrl) {
      // 1. URL मधून S3 key extract करणे
      const keyToDelete = extractKeyFromUrl(previousProfilePicUrl);
      if (keyToDelete) {
        try {
          // 2. S3 मधून जुनी file delete करणे
          await DeleteFiles(keyToDelete); // ✅ S3 मधून delete
          console.log(`Deleted previous profile picture: ${keyToDelete}`);
        } catch (error) {
          console.warn("Delete failed:", error);
          // Continue anyway - don't block the operation
          // Continue with upload even if delete fails
        }
      }
    }

    // Upload new profile picture
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uniqueFileName = generateUniqueFileName();
    const extension = getFileExtension(file.type, file.name);
    const key = `${folder}/${uniqueFileName}.${extension}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in",
      Key: key,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return key;
  } catch (error) {
    console.error("Error uploading new profile picture:", error);
    return null;
  }
};

