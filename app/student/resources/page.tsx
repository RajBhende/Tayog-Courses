"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentResourcesHeader } from "@/components/student/StudentResourcesHeader";
import { StudentResourcesGrid } from "@/components/student/StudentResourcesGrid";

export default function StudentResourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Authentication check
  React.useEffect(() => {
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

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center justify-between pt-4 border-t">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a student
  if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
    return null;
  }

  return (
    <div className="space-y-6">
      <StudentResourcesHeader />
      <StudentResourcesGrid />
    </div>
  );
}

