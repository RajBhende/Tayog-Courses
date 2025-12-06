"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Main Card Container */}
      <div className="w-full max-w-3xl md:max-w-4xl aspect-square md:aspect-4/3 lg:aspect-5/3 bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Gradient */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 flex flex-col justify-between p-5 sm:p-6 md:p-8 min-h-[200px] md:min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            {/* Logo */}
            <div className="flex justify-start">
              <Image
                src="/logo/tayogwhite.svg"
                alt="Tayog Logo"
                width={238}
                height={77}
                className="h-8 sm:h-10 md:h-12 w-auto"
              />
            </div>

            {/* Title and Description */}
            <div className="flex flex-col gap-2 sm:gap-2 md:gap-3">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                Tayog Courses
              </h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed mb-2">
                A modern, AI-powered learning environment designed for seamless
                collaboration between teachers and students.
              </p>
              <div className="flex flex-col gap-1.5 sm:gap-2 mt-1">
                <div className="flex items-start gap-2">
                  <span className="text-white/90 text-xs sm:text-sm mt-0.5">✓</span>
                  <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                    Interactive assignments & real-time grading
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white/90 text-xs sm:text-sm mt-0.5">✓</span>
                  <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                    Live classes & scheduled sessions
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white/90 text-xs sm:text-sm mt-0.5">✓</span>
                  <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
                    Rich resources & study materials
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-white/80 text-xs mt-4 md:mt-0">© 2025 Tayog Courses</p>
        </div>

        {/* Right Section - Portal Selection */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-5 sm:p-6 md:p-8 bg-white">
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-5 md:mb-6 text-center">
              Select Your Portal
            </h2>

            <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 w-full max-w-md mx-auto">
              {/* Teacher Portal Card */}
              <div className="space-y-1">
                <Link href="/teacher/login" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                    <CardContent className="p-2.5 sm:p-3 md:p-3.5">
                      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-black">
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
              </div>

              {/* Student Portal Card */}
              <div className="space-y-1">
                <Link href="/student/login" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                    <CardContent className="p-2.5 sm:p-3 md:p-3.5">
                      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 text-green-600" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-black">
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
    </div>
  );
}

