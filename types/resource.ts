export type ResourceType = "PDF_DOCUMENT" | "VIDEO_CLASS" | "IMAGE";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  attachment: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceInput {
  title: string;
  type: string;
  file?: File;
}

export interface ResourceResponse {
  success: boolean;
  id: string;
  title: string;
  type: ResourceType;
  attachment: string;
  createdAt: string;
}
