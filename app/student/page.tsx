"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCourseStore } from "@/lib/courseStore";
import { useEffect } from "react";

export default function StudentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { selectedCourseId } = useCourseStore();

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/student/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "STUDENT") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (selectedCourseId) {
      router.replace("/student/dashboard");
    } else {
      router.replace("/student/lobby");
    }
  }, [selectedCourseId, router]);

  return null;
}
