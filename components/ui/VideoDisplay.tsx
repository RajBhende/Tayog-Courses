/**
 * Video Display Component
 * Feed मध्ये videos display करण्यासाठी
 * 
 * Usage:
 * <VideoDisplay 
 *   videoUrl="https://s3.../video.mp4"
 *   className="mt-3"
 * />
 * 
 * OR for multiple videos:
 * <VideoDisplay 
 *   videos={videoUrls}
 *   className="mt-3"
 * />
 */
"use client";

import React from "react";

interface VideoDisplayProps {
  // Single video
  videoUrl?: string;
  
  // Multiple videos
  videos?: string[];
  
  // Common props
  className?: string;
  poster?: string; // Thumbnail image
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoUrl,
  videos,
  className = "",
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
}) => {
  // Single video mode
  if (videoUrl) {
    return (
      <div className={`w-full rounded-lg overflow-hidden ${className}`}>
        <video
          src={videoUrl}
          className="w-full rounded-lg"
          controls
          poster={poster}
          preload="metadata"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Multiple videos mode
  if (videos && videos.length > 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {videos.map((video, index) => {
          return (
            <div key={index} className="w-full rounded-lg overflow-hidden">
              <video
                src={video}
                className="w-full rounded-lg"
                controls
                poster={poster}
                preload="metadata"
                autoPlay={autoPlay && index === 0}
                muted={muted}
                loop={loop}
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export default VideoDisplay;

