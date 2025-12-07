"use client";

import { useEffect } from "react";
import { LandingPage } from "@/components/landing/LandingPage";
import { useCourseStore } from "@/lib/courseStore";

export default function HomePage() {
  const clearCourse = useCourseStore((state) => state.clearCourse);

  useEffect(() => {
    // Clear course selection when returning to home page
    clearCourse();
  }, [clearCourse]);

  return <LandingPage />;
}