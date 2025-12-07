"use client";

import * as React from "react";
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
import { FileText, Video, MoreVertical, Upload, X, Image as ImageIcon, FolderOpen, Check, Download } from "lucide-react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-900">
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
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No resources found. Upload your first resource!
          </div>
        ) : (
          resources.map((resource) => {
            const typeInfo = resourceTypeMap[resource.type] || { icon: "pdf" as const, label: resource.type };
            const isToday = new Date(resource.createdAt).toDateString() === new Date().toDateString();
            const addedDate = isToday ? "Added Today" : format(new Date(resource.createdAt), "MMM dd, yyyy");

            return (
              <Card 
                key={resource.id} 
                className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    {/* Three dots menu for all types */}
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              if (resource.type === "PDF_DOCUMENT" && resource.attachment) {
                                window.open(resource.attachment, '_blank');
                              } else {
                                setViewingResource(resource);
                              }
                            }}
                          >
                            View Content
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (resource.attachment) {
                                window.open(resource.attachment, '_blank');
                              }
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                variant="destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{resource.title}"? This action cannot be undone and the file will be permanently removed from S3.
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Icon for all types */}
                    <div className="mb-4">
                      {typeInfo.icon === "pdf" && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100">
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

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h3>

                    {/* Type label */}
                    <p className="text-xs text-muted-foreground uppercase mb-4">
                      {typeInfo.label}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        {addedDate}
                      </span>
                      <div className="flex items-center gap-2">
                        {resource.attachment && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (resource.attachment) {
                                  window.open(resource.attachment, '_blank');
                                }
                              }}
                              className="h-8"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="link"
                              onClick={() => {
                                if (resource.type === "PDF_DOCUMENT" && resource.attachment) {
                                  window.open(resource.attachment, '_blank');
                                } else {
                                  setViewingResource(resource);
                                }
                              }}
                              className="h-auto p-0 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Content &gt;
                            </Button>
                          </>
                        )}
                      </div>
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
