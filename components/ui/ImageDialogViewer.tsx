/**
 * Image Dialog Viewer Component
 * Feed मध्ये image click केल्यावर full screen dialog दाखवण्यासाठी
 * 
 * Usage:
 * <ImageDialogViewer 
 *   imageUrl="https://s3.../image.jpg"
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * />
 * 
 * OR for multiple images:
 * <ImageDialogViewer 
 *   images={["url1", "url2", "url3"]}
 *   currentIndex={0}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onNext={handleNext}
 *   onPrevious={handlePrevious}
 * />
 */
"use client";

import React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageDialogViewerProps {
  // Single image mode
  imageUrl?: string;
  
  // Multiple images mode
  images?: string[];
  currentIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  
  // Common props
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

const ImageDialogViewer: React.FC<ImageDialogViewerProps> = ({
  imageUrl,
  images,
  currentIndex = 0,
  onNext,
  onPrevious,
  isOpen,
  onClose,
  alt = "Image",
}) => {
  // Single image mode
  if (imageUrl) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white backdrop-blur-lg transition hover:bg-black/70"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image Container */}
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Multiple images mode
  if (images && images.length > 0) {
    const handlePrevious = () => {
      if (onPrevious) {
        onPrevious();
      }
    };

    const handleNext = () => {
      if (onNext) {
        onNext();
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 bg-black/90 border-none">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white backdrop-blur-lg transition hover:bg-black/70"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Current Image */}
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Navigation (if multiple images) */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-lg transition hover:bg-black/70 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-lg transition hover:bg-black/70 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded-full backdrop-blur-lg text-white text-sm z-10">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default ImageDialogViewer;

