"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { AppSidebar } from "@/components/ui/TeacherSidebar";
import { useCourseStore } from "@/lib/courseStore";
import { useRouter } from "next/navigation";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/teacher/login" || pathname === "/teacher/signup";
  const isCoursesPage = pathname === "/teacher/courses";
  const isLobbyPage = pathname === "/teacher/lobby";
  const { selectedCourseId, selectedCourse, role } = useCourseStore();

  useEffect(() => {
    if (!isLoginPage && !isCoursesPage && !isLobbyPage && !selectedCourseId) {
      router.replace("/teacher/lobby");
    }
  }, [isLoginPage, isCoursesPage, isLobbyPage, selectedCourseId, router]);

  if (isLoginPage || isCoursesPage || isLobbyPage) {
    return <>{children}</>;
  }

  if (!selectedCourseId || role !== "TEACHER") {
    return null;
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-4">
              {selectedCourse?.name && (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-gray-500">Current course</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[220px]" title={selectedCourse.name}>
                    {selectedCourse.name}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/teacher/lobby")}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Change Course
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}

