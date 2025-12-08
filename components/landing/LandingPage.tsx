"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function LandingPage() {
  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Main Card Container */}
      <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Gradient */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-8 min-h-[250px] sm:min-h-[300px] md:min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {/* Logo */}
            {/* <div className="flex justify-start">
              <Image
                src="/logo/tayogwhite.svg"
                alt="Tayog Logo"
                width={238}
                height={77}
                className="h-8 sm:h-10 md:h-12 w-auto"
              />
            </div> */}

            {/* Title and Description */}
            <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                Tayog Courses
              </h1>
              <p className="text-white/90 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed mb-1 sm:mb-2">
                A modern, AI-powered learning environment designed for seamless
                collaboration between teachers and students.
              </p>
              <div className="flex flex-col gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                <div className="flex items-start gap-2">
                  <span className="text-white/90 text-xs sm:text-sm md:text-base mt-0.5 shrink-0">✓</span>
                  <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed">
                    Interactive assignments & real-time grading
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white/90 text-xs sm:text-sm md:text-base mt-0.5 shrink-0">✓</span>
                  <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed">
                    Live classes & scheduled sessions
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-white/90 text-xs sm:text-sm md:text-base mt-0.5 shrink-0">✓</span>
                  <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed">
                    Rich resources & study materials
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-white/80 text-[10px] sm:text-xs mt-4 sm:mt-6 md:mt-0">© 2025 Tayog Courses</p>
        </div>

        {/* Right Section - Portal Selection */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-4 sm:p-5 md:p-6 lg:p-8 bg-white">
          <div className="w-full flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-center">
              Select Your Portal
            </h2>

            <div className="flex flex-col gap-3 sm:gap-3.5 md:gap-4 w-full max-w-md mx-auto">
              {/* Teacher Portal Card */}
              <div className="space-y-1">
                <Link href="/teacher/login" className="block">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 active:scale-[0.98]">
                    <CardContent className="p-3 sm:p-3.5 md:p-4 lg:p-5">
                      <div className="flex items-center gap-2.5 sm:gap-3 md:gap-3.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" />
                        </div>
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black">
                            Teacher Portal
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
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
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 active:scale-[0.98]">
                    <CardContent className="p-3 sm:p-3.5 md:p-4 lg:p-5">
                      <div className="flex items-center gap-2.5 sm:gap-3 md:gap-3.5">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-green-600" />
                        </div>
                        <div className="flex flex-col gap-0.5 sm:gap-1">
                          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black">
                            Student Portal
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
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

