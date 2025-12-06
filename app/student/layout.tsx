"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SearchBar } from "@/components/ui/SearchBar";
import { StudentSidebar } from "@/components/ui/StudentSidebar";
import { useCourseStore } from "@/lib/courseStore";
import { CourseSelectionDialog } from "@/components/student/CourseSelectionDialog";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage =
    pathname === "/student/login" || pathname === "/student/signup";
  const { selectedCourseId, role, hasShownDialog, setHasShownDialog } =
    useCourseStore();
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

  if (!selectedCourseId || role !== "STUDENT") {
    return (
      <>
        <CourseSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please select a course to continue
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CourseSelectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <SidebarProvider>
        <StudentSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-4">
              <SearchBar />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
