"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Video, MoreVertical, Upload, X, Image as ImageIcon, FolderOpen, Check, Download, Trash2, Calendar } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import ImageDialogViewer from "@/components/ui/ImageDialogViewer";
import VideoDisplay from "@/components/ui/VideoDisplay";
import { useResources } from "@/hooks/teacher/resources/useResources";
import { useCreateResource } from "@/hooks/teacher/resources/useCreateResource";
import { useDeleteResource } from "@/hooks/teacher/resources/useDeleteResource";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Resource } from "@/types";

const resourceTypeMap: Record<string, { icon: "pdf" | "video" | "image"; label: string }> = {
  PDF_DOCUMENT: { icon: "pdf", label: "PDF DOCUMENT" },
  VIDEO_CLASS: { icon: "video", label: "VIDEO CLASS" },
  IMAGE: { icon: "image", label: "IMAGE" },
};

export default function ResourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("Note / PDF");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [viewingResource, setViewingResource] = React.useState<Resource | null>(null);
  const [deletingResourceId, setDeletingResourceId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { data: resources = [], isLoading: isLoadingResources } = useResources();
  const { mutate: createResource, isPending: isUploading } = useCreateResource();
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();

  // Authentication check
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/teacher/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  const getAcceptTypes = () => {
    switch (type) {
      case "Note / PDF":
        return ".pdf,.doc,.docx";
      case "Video Class":
        return "video/*";
      case "Image":
        return "image/*";
      default:
        return "*/*";
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      
      // Create preview based on file type
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs and documents, just show file info
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setUploadSuccess(false);

    createResource(
      {
        title: title.trim() || selectedFile.name,
        type: type as "Note / PDF" | "Video Class" | "Image",
        file: selectedFile,
      },
      {
        onSuccess: () => {
          setUploadSuccess(true);
          setTimeout(() => {
            setTitle("");
            setSelectedFile(null);
            setFilePreview(null);
            setUploadSuccess(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }, 1500);
        },
        onError: (error) => {
          console.error("Error uploading file:", error);
          alert("Failed to upload file. Please try again.");
        },
      }
    );
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>

        {/* Upload Section Skeleton */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-end gap-4 flex-wrap">
              <Skeleton className="h-10 flex-1 min-w-[200px]" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center justify-between pt-4 border-t">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a teacher
  if (status === "unauthenticated" || session?.user?.role !== "TEACHER") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Resource Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Learning materials and recordings
        </p>
      </div>

      {/* Upload Section */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                Title / Topic
              </Label>
              <Input
                placeholder="e.g. Thermodynamics Summary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="min-w-[150px]">
              <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">
                Type
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Note / PDF">Note / PDF</SelectItem>
                  <SelectItem value="Video Class">Video Class</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleChooseFileClick}
              disabled={isUploading}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={getAcceptTypes()}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-white rounded-md border">
              <div className="flex items-start gap-4 mb-4">
                {/* Preview */}
                {filePreview && type === "Image" && (
                  <div className="shrink-0 relative h-20 w-20">
                    <Image
                      src={filePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md border"
                    />
                  </div>
                )}
                {filePreview && type === "Video Class" && (
                  <div className="shrink-0">
                    <video
                      src={filePreview}
                      className="h-20 w-20 object-cover rounded-md border"
                      controls={false}
                    />
                  </div>
                )}
                {(type === "Note / PDF" || !filePreview) && (
                  <div className="shrink-0 flex h-20 w-20 items-center justify-center rounded-md bg-blue-100">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {selectedFile.name}
                    </p>
                    {uploadSuccess && (
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    {isUploading && (
                      <Spinner className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {isUploading && (
                    <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                  )}
                  {uploadSuccess && (
                    <p className="text-xs text-green-600 mt-1">Uploaded successfully!</p>
                  )}
                </div>

                {/* Remove Button */}
                {!isUploading && !uploadSuccess && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Submit Button */}
              {!uploadSuccess && (
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isUploading || !title.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingResources ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
          </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No resources found. Upload your first resource!
          </div>
        ) : (
          resources.map((resource) => {
            const typeInfo = resourceTypeMap[resource.type] || { icon: "pdf" as const, label: resource.type };
            const formattedDate = format(new Date(resource.createdAt), "MMM dd, yyyy");

            return (
              <Card 
                key={resource.id} 
                className="relative overflow-hidden transition-all duration-200"
              >
                <CardContent className="p-4 relative">
                  <div className="flex items-center gap-4">
                    {/* Icon on left */}
                    <div className="shrink-0">
                      {typeInfo.icon === "pdf" && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-100">
                          <FileText className="h-6 w-6 text-amber-800" />
                        </div>
                      )}
                      {typeInfo.icon === "video" && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100">
                          <Video className="h-6 w-6 text-red-600" />
                        </div>
                      )}
                      {typeInfo.icon === "image" && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
                          <ImageIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-2 truncate">
                        {resource.title}
                      </h3>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Icons on right */}
                    <div className="flex items-center gap-2">
                      {resource.attachment && (
                        <button
                          type="button"
                          className="p-0 border-0 bg-transparent cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (resource.attachment) {
                              window.open(resource.attachment, '_blank');
                            }
                          }}
                          title="Download"
                        >
                          <Download
                            className="h-4 w-4 text-muted-foreground hover:text-blue-600 transition-colors"
                          />
                        </button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="p-0 border-0 bg-transparent cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                            title="Delete"
                          >
                            <Trash2
                              className="h-4 w-4 text-muted-foreground hover:text-red-600 transition-colors"
                            />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{resource.title}"? 
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteResource(resource.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* File Viewer Dialog - LinkedIn Style */}
      {viewingResource && viewingResource.type === "IMAGE" ? (
        <ImageDialogViewer
          imageUrl={viewingResource.attachment}
          isOpen={!!viewingResource}
          onClose={() => setViewingResource(null)}
          alt={viewingResource.title}
        />
      ) : viewingResource && viewingResource.type === "VIDEO_CLASS" ? (
        <Dialog open={!!viewingResource} onOpenChange={(open) => !open && setViewingResource(null)}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-black border-none">
            <div className="flex-1 overflow-auto bg-black p-6">
              <div className="flex justify-center items-center min-h-[60vh]">
                <VideoDisplay
                  videoUrl={viewingResource.attachment}
                  className="w-full max-w-4xl"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingResourceId} onOpenChange={(open) => !open && setDeletingResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot be undone and the file will be permanently removed from S3.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingResourceId) {
                  deleteResource(deletingResourceId, {
                    onSuccess: () => {
                      setDeletingResourceId(null);
                    },
                    onError: (error) => {
                      console.error("Error deleting resource:", error);
                      alert("Failed to delete resource. Please try again.");
                    },
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
