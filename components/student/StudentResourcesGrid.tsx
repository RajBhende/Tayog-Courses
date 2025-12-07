"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ImageDialogViewer from "@/components/ui/ImageDialogViewer";
import VideoDisplay from "@/components/ui/VideoDisplay";
import { Button } from "@/components/ui/button";
import { FileText, Video, Download, Image as ImageIcon } from "lucide-react";
import { useResources, type StudentResource } from "@/hooks/student/resources/useResources";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function StudentResourcesGrid() {
  const { data: resources = [], isLoading } = useResources();
  const [viewingResource, setViewingResource] = React.useState<StudentResource | null>(null);

  const handleDownload = (attachment: string) => {
    window.open(attachment, '_blank');
  };

  const handleView = (resource: StudentResource) => {
    if (resource.type === "PDF_DOCUMENT" && resource.attachment) {
      window.open(resource.attachment, '_blank');
    } else {
      setViewingResource(resource);
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No resources found.
      </div>
    );
  }

  const resourceTypeMap: Record<string, { icon: "pdf" | "video" | "image"; label: string }> = {
    PDF_DOCUMENT: { icon: "pdf", label: "PDF DOCUMENT" },
    VIDEO_CLASS: { icon: "video", label: "VIDEO CLASS" },
    IMAGE: { icon: "image", label: "IMAGE" },
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          const typeInfo = resourceTypeMap[resource.type] || { icon: "pdf" as const, label: resource.type };
          const isToday = new Date(resource.createdAt).toDateString() === new Date().toDateString();
          const addedDate = isToday ? "Added Today" : format(new Date(resource.createdAt), "MMM dd, yyyy");

          return (
            <Card 
              key={resource.id} 
              className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              onClick={() => handleView(resource)}
            >
              <CardContent className="p-0">
                <div className="p-6">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(resource.attachment);
                        }}
                        className="h-8"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(resource);
                        }}
                        className="h-auto p-0 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Content &gt;
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
    </>
  );
}

