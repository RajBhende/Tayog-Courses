"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCourseStore } from "@/lib/courseStore";
import { useEffect } from "react";
  
export default function TeacherPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { selectedCourseId } = useCourseStore();

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/teacher/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (selectedCourseId) {
      router.replace("/teacher/dashboard");
    } else {
      router.replace("/teacher/lobby");
    }
  }, [selectedCourseId, router]);

  return null;
}