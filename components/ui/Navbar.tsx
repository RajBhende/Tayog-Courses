"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface NavbarProps {
  userName: string;
  userRole: "Teacher" | "Student";
  userInitials: string;
  userEmail?: string;
  avatarColor?: "purple" | "green";
  onLogout: () => void;
}

export function Navbar({
  userName,
  userRole,
  userInitials,
  userEmail,
  avatarColor = "purple",
  onLogout,
}: NavbarProps) {
  const avatarBgColor = avatarColor === "purple" ? "bg-purple-600" : "bg-green-600";

  return (
    <section className="bg-white z-50 w-full shadow-sm border-b sticky top-0 py-2 h-[60px] flex items-center justify-between">
      <nav className="flex justify-between w-full bg-white max-w-7xl sm:px-3 md:px-6 mx-auto items-center">
        <div className="flex items-center gap-2 lg:gap-3">
          <Link href="/">
            <Image
              src="/logo/tayoglogo.svg"
              alt="Tayog"
              className="h-8 w-auto"
              width={120}
              height={32}
            />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {userName && (
            <>
              <div className="hidden sm:flex flex-col items-end max-w-[150px]">
                <span className="font-semibold text-sm text-gray-900 truncate" title={userName}>
                  {truncateName(userName, 18)}
                </span>
                <span className="text-xs text-gray-600 truncate">
                  {userRole}
                </span>
              </div>
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="" />
                <AvatarFallback className={avatarBgColor + " text-white text-xs"}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-700"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </nav>
    </section>
  );
}
