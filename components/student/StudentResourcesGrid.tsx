"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Download, Image as ImageIcon } from "lucide-react";
import { useResources } from "@/hooks/student/resources/useResources";
import { format } from "date-fns";

export function StudentResourcesGrid() {
  const { data: resources = [], isLoading } = useResources();

  const handleDownload = (attachment: string) => {
    window.open(attachment, '_blank');
  };

  const handleView = (attachment: string) => {
    window.open(attachment, '_blank');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading resources...
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => {
        const typeInfo = resourceTypeMap[resource.type] || { icon: "pdf" as const, label: resource.type };
        const isToday = new Date(resource.createdAt).toDateString() === new Date().toDateString();
        const addedDate = isToday ? "Added Today" : format(new Date(resource.createdAt), "MMM dd, yyyy");

        return (
          <Card key={resource.id} className="relative">
            <CardContent className="p-6">
              {/* Icon */}
              <div className="mb-4">
                {typeInfo.icon === "pdf" ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100">
                    <FileText className="h-6 w-6 text-amber-800" />
                  </div>
                ) : typeInfo.icon === "video" ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100">
                    <Video className="h-6 w-6 text-red-600" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100">
                    <ImageIcon className="h-6 w-6 text-green-600" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>

              {/* Type */}
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
                    onClick={() => handleDownload(resource.attachment)}
                    className="h-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => handleView(resource.attachment)}
                    className="h-auto p-0 text-blue-600 hover:text-blue-700"
                  >
                    View &gt;
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

