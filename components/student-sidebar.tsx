"use client";

import * as React from "react";
import {
  Calendar,
  FileText,
  Home,
  LogOut,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/student",
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
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear any stored authentication data
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    // Redirect to home page
    router.push("/home");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/student" className="flex items-center gap-3">
                <div className="flex shrink-0 items-center justify-center">
                  <Image
                    src="/logo/tayog.svg"
                    alt="Tayog Logo"
                    width={32}
                    height={32}
                    className="group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
                  />
                </div>
                <span className="truncate font-semibold text-sm group-data-[collapsible=icon]:hidden">
                  Kalnet
                </span>
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
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <p className="truncate font-semibold text-sm">Alice Smith</p>
                <p className="truncate text-xs text-muted-foreground">Student</p>
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

