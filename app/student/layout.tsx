"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { StudentSidebar } from "@/components/ui/StudentSidebar";
import { useCourseStore } from "@/lib/courseStore";
import { useRouter } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage =
    pathname === "/student/login" || pathname === "/student/signup";
  const isLobbyPage = pathname === "/student/lobby";
  const { selectedCourseId, role } = useCourseStore();

  useEffect(() => {
    if (!isLoginPage && !isLobbyPage && !selectedCourseId) {
      router.replace("/student/lobby");
    }
  }, [isLoginPage, isLobbyPage, selectedCourseId, router]);

  if (isLoginPage || isLobbyPage) {
    return <>{children}</>;
  }

  if (!selectedCourseId || role !== "STUDENT") {
    return null;
  }

  return (
    <SidebarProvider>
      <StudentSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/student/lobby")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Change Course
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
