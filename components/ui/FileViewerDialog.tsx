"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ImageDialogViewer from "./ImageDialogViewer";
import VideoDisplay from "./VideoDisplay";

interface FileViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
}

export function FileViewerDialog({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  fileType,
}: FileViewerDialogProps) {
  const [isImageOpen, setIsImageOpen] = React.useState(false);

  // Determine file type from URL or extension
  const detectedFileType = React.useMemo(() => {
    if (fileType) return fileType.toLowerCase();
    
    const url = fileUrl.toLowerCase();
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image";
    if (url.match(/\.(pdf)$/)) return "pdf";
    if (url.match(/\.(mp4|webm|ogg|mov)$/)) return "video";
    if (url.match(/\.(doc|docx)$/)) return "document";
    if (url.match(/\.(xls|xlsx)$/)) return "spreadsheet";
    if (url.match(/\.(ppt|pptx)$/)) return "presentation";
    if (url.match(/\.(txt)$/)) return "text";
    return "unknown";
  }, [fileUrl, fileType]);

  // For images, use the existing ImageDialogViewer
  if (detectedFileType === "image") {
    return (
      <>
        <ImageDialogViewer
          imageUrl={fileUrl}
          isOpen={isImageOpen}
          onClose={() => {
            setIsImageOpen(false);
            onOpenChange(false);
          }}
          alt={fileName || "Image"}
        />
        <Dialog open={open && !isImageOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{fileName || "File Viewer"}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImageOpen(true)}
                  title="View Full Size"
                >
                  View Full Size
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 border rounded-lg">
                <div className="relative w-full h-64">
                  <Image
                    src={fileUrl}
                    alt={fileName || "Preview"}
                    fill
                    className="object-contain rounded"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // For videos, use VideoDisplay
  if (detectedFileType === "video") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-black border-none">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white">
              <span>{fileName || "Video Viewer"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-black p-6">
            <div className="flex justify-center items-center min-h-[60vh]">
              <VideoDisplay
                videoUrl={fileUrl}
                className="w-full max-w-4xl"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // For PDFs, use iframe
  if (detectedFileType === "pdf") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              <span>{fileName || "PDF Viewer"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              <iframe
                src={fileUrl}
                className="w-full h-full"
                title={fileName || "PDF Viewer"}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // For other file types
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{fileName || "File Viewer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg space-y-4">
            <div className="text-6xl">
              {detectedFileType === "document" && "📄"}
              {detectedFileType === "spreadsheet" && "📊"}
              {detectedFileType === "presentation" && "📽️"}
              {detectedFileType === "text" && "📝"}
              {detectedFileType === "unknown" && "📎"}
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">{fileName || "File"}</p>
              <p className="text-sm text-muted-foreground">
                This file type cannot be previewed in the dialog.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
