"use client";

import { useRouter } from "next/navigation";
import { useCourseStore } from "@/lib/courseStore";
import { useEffect } from "react";

export default function StudentPage() {
  const router = useRouter();
  const { selectedCourseId } = useCourseStore();

  useEffect(() => {
    if (selectedCourseId) {
      router.replace("/student/dashboard");
    } else {
      router.replace("/student/lobby");
    }
  }, [selectedCourseId, router]);

  return null;
}
