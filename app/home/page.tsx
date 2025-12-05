"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Main Card Container */}
      <div className="w-full max-w-3xl md:max-w-4xl aspect-square md:aspect-4/3 lg:aspect-5/3 bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Blue Gradient */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-600 to-blue-400 flex flex-col justify-between p-5 sm:p-6 md:p-8 min-h-[200px] md:min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            {/* Logo */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 text-blue-600" />
            </div>

            {/* Title and Description */}
            <div className="flex flex-col gap-2 sm:gap-2 md:gap-3">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                EduNexus Platform
              </h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed">
                A modern, AI-powered learning environment designed for seamless
                collaboration between teachers and students.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-white/80 text-xs mt-4 md:mt-0">© 2023 EduNexus Inc.</p>
        </div>

        {/* Right Section - Portal Selection */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-5 sm:p-6 md:p-8 bg-white">
          <div className="w-full">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-5 md:mb-6">
              Select Your Portal
            </h2>

            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
              {/* Teacher Portal Card */}
              <Link href="/teacher/login" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                  <CardContent className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black">
                          Teacher Portal
                        </h3>
                        <p className="text-xs sm:text-xs md:text-sm text-gray-600">
                          Manage classes, grade work & AI tools
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Student Portal Card */}
              <Link href="/student/login" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                  <CardContent className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 text-green-600" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black">
                          Student Portal
                        </h3>
                        <p className="text-xs sm:text-xs md:text-sm text-gray-600">
                          Access assignments & resources
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

