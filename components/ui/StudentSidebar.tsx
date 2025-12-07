"use client";

import * as React from "react";
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Users,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCourseStore } from "@/lib/courseStore";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/student/dashboard",
  },
  {
    title: "Assignments",
    icon: FileText,
    href: "/student/assignments",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/student/schedule",
  },
  {
    title: "Resources",
    icon: Video,
    href: "/student/resources",
  },
  {
    title: "People",
    icon: Users,
    href: "/student/people",
  },
];

// Helper function to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper function to truncate long names intelligently
function truncateName(name: string, maxLength: number = 20): string {
  if (!name || name.length <= maxLength) return name;
  
  const parts = name.trim().split(" ").filter(p => p.length > 0);
  
  // If single word, truncate it
  if (parts.length === 1) {
    return name.substring(0, maxLength - 3) + "...";
  }
  
  // Try first name + middle name(s) if it fits
  if (parts.length >= 3) {
    // Try: FirstName + MiddleName(s) + LastInitial
    let result = parts[0];
    for (let i = 1; i < parts.length - 1; i++) {
      const withMiddle = `${result} ${parts[i]}`;
      const withLastInitial = `${withMiddle} ${parts[parts.length - 1][0]}.`;
      if (withLastInitial.length + 3 <= maxLength) {
        result = withMiddle;
      } else {
        break;
      }
    }
    const lastInitial = `${result} ${parts[parts.length - 1][0]}.`;
    if (lastInitial.length + 3 <= maxLength) {
      return lastInitial + "...";
    }
  }
  
  // Try first name + last name initial
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const withLastInitial = `${firstName} ${lastName[0]}.`;
    
    if (withLastInitial.length + 3 <= maxLength) {
      return withLastInitial + "...";
    }
    
    // If still too long, just show first name + "..."
    if (firstName.length + 3 <= maxLength) {
      return firstName + "...";
    }
    
    // If first name itself is too long
    return firstName.substring(0, maxLength - 3) + "...";
  }
  
  // Fallback: truncate the whole string
  return name.substring(0, maxLength - 3) + "...";
}

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { data: session } = useSession();
  const clearCourse = useCourseStore((state) => state.clearCourse);

  const fullUserName = session?.user?.name || "User";
  const userName = truncateName(fullUserName, 20);
  const userRole = session?.user?.role === "TEACHER" ? "Teacher" : session?.user?.role === "STUDENT" ? "Student" : "";
  const userInitials = getInitials(session?.user?.name);

  const handleLogout = async () => {
    // Clear course store
    clearCourse();
    // Clear any stored authentication data
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    // Sign out from next-auth
    await nextAuthSignOut({ redirect: false });
    // Redirect to landing page with full page reload
    window.location.href = "/";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/student/dashboard" className="flex items-center gap-3">
                <div className="flex shrink-0 items-center justify-start">
                  <Image
                    src={state === "collapsed" ? "/logo/tayog.svg" : "/logo/tayoglogo.svg"}
                    alt="Tayog Logo"
                    width={state === "collapsed" ? 32 : 238}
                    height={state === "collapsed" ? 32 : 77}
                    className={state === "collapsed" ? "h-8 w-8" : "h-auto max-w-[120px] object-contain"}
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname?.startsWith(item.href + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center">
              <Avatar>
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden min-w-0 flex-1">
                <p className="font-semibold text-sm truncate" title={fullUserName}>{userName}</p>
                <p className="truncate text-xs text-muted-foreground">{userRole}</p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 data-[active=false]:hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

