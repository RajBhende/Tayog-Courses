"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "@/components/ui/SearchBar";
import { AppSidebar } from "@/components/ui/TeacherSidebar";
import { useCourseStore } from "@/lib/courseStore";
import { CourseSelectionDialog } from "@/components/teacher/CourseSelectionDialog";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/teacher/login" || pathname === "/teacher/signup";
  const { selectedCourseId, role, hasShownDialog, setHasShownDialog } = useCourseStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoginPage && !selectedCourseId && !hasShownDialog) {
      setDialogOpen(true);
      setHasShownDialog(true);
    }
  }, [isLoginPage, selectedCourseId, hasShownDialog, setHasShownDialog]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!selectedCourseId || role !== "TEACHER") {
    return (
      <>
        <CourseSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Please select a course to continue</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CourseSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
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
    </>
  );
}

