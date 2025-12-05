"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, Download } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  type: "PDF DOCUMENT" | "VIDEO CLASS";
  icon: "pdf" | "video";
  addedDate: string;
}

const resources: Resource[] = [
  {
    id: "1",
    title: "Physics Chapter 1 Notes",
    type: "PDF DOCUMENT",
    icon: "pdf",
    addedDate: "Added Today",
  },
  {
    id: "2",
    title: "Math Lecture: Limits",
    type: "VIDEO CLASS",
    icon: "video",
    addedDate: "Added Today",
  },
];

export function StudentResourcesGrid() {
  const handleDownload = (resourceId: string) => {
    // TODO: Implement download logic
    console.log("Downloading resource:", resourceId);
  };

  const handleView = (resourceId: string) => {
    // TODO: Implement view logic
    console.log("Viewing resource:", resourceId);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <Card key={resource.id} className="relative">
          <CardContent className="p-6">
            {/* Icon */}
            <div className="mb-4">
              {resource.icon === "pdf" ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100">
                  <FileText className="h-6 w-6 text-amber-800" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100">
                  <Video className="h-6 w-6 text-red-600" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>

            {/* Type */}
            <p className="text-xs text-muted-foreground uppercase mb-4">
              {resource.type}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-xs text-muted-foreground">
                {resource.addedDate}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(resource.id)}
                  className="h-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="link"
                  onClick={() => handleView(resource.id)}
                  className="h-auto p-0 text-blue-600 hover:text-blue-700"
                >
                  View &gt;
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

