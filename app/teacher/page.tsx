"use client";

import { useRouter } from "next/navigation";
import { useCourseStore } from "@/lib/courseStore";
import { useEffect } from "react";
  
export default function TeacherPage() {
  const router = useRouter();
  const { selectedCourseId } = useCourseStore();

  useEffect(() => {
    if (selectedCourseId) {
      router.replace("/teacher/dashboard");
    } else {
      router.replace("/teacher/lobby");
    }
  }, [selectedCourseId, router]);

  return null;
}