"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/ui/SearchBar";
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
  const { selectedCourseId, role } = useCourseStore();

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
              <SearchBar />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}

