import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate S3 file URL for display (previous project format)
 * @param key - S3 key (path) of the file
 * @returns Public URL of the file
 */
export function getS3FileUrl(key: string): string {
  const bucket = process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in";
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";
  
  // Generate S3 public URL (previous project format)
  return `https://s3.${region}.amazonaws.com/${bucket}/${key}`;
}

/**
 * Generate S3 image URL from key (for next/image compatibility)
 * @param image - S3 key (path) of the image
 * @returns Full S3 URL
 */
export function getImageUrl(image: string): string {
  const bucket = process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in";
  const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";
  return `https://s3.${region}.amazonaws.com/${bucket}/${image}`;
}

/**
 * Extract S3 key from URL
 * @param url - S3 file URL or key
 * @returns S3 key (path) extracted from URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const bucket = process.env.NEXT_PUBLIC_BUCKET_NAME || "tayog.in";
    
    // If it's already a key (starts with folder path), return as is
    if (url.startsWith("tayogcourses/") || url.startsWith("profile/") || url.startsWith("post/")) {
      return url;
    }
    
    // URL मधून key extract करणे
    // Format: "https://s3.region.amazonaws.com/bucket/key" or "https://bucket.s3.region.amazonaws.com/key"
    const urlParts = url.split(`${bucket}/`);
    if (urlParts.length > 1) {
      const key = urlParts[1];
      // Remove query parameters if any
      return key.split('?')[0];
    }
    
    // Try alternative URL format: bucket.s3.region.amazonaws.com/key
    const altUrlParts = url.split(`.s3.`);
    if (altUrlParts.length > 1) {
      const afterS3 = altUrlParts[1];
      const keyPart = afterS3.split('/').slice(1).join('/');
      if (keyPart) {
        return keyPart.split('?')[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting key from URL:", error);
    return null;
  }
}