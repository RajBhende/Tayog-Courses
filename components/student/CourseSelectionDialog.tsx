"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// Mock courses data - will be replaced with API later
const MOCK_COURSES: Course[] = [
  {
    id: "1",
    name: "History",
    code: "HIST101",
    description: "World History and Civilizations",
  },
  {
    id: "2",
    name: "Mathematics",
    code: "MATH201",
    description: "Advanced Calculus and Algebra",
  },
  {
    id: "3",
    name: "Physics",
    code: "PHYS301",
    description: "Mechanics and Thermodynamics",
  },
  {
    id: "4",
    name: "Chemistry",
    code: "CHEM201",
    description: "Organic and Inorganic Chemistry",
  },
  {
    id: "5",
    name: "English",
    code: "ENG101",
    description: "Literature and Composition",
  },
  {
    id: "6",
    name: "Computer Science",
    code: "CS301",
    description: "Data Structures and Algorithms",
  },
];

interface CourseSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseSelectionDialog({
  open,
  onOpenChange,
}: CourseSelectionDialogProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(
    null
  );

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    // Navigate to dashboard with course parameter
    router.push(`/student?course=${courseId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl">Select Your Course</DialogTitle>
          </div>
          <DialogDescription>
            Choose a course to view its dashboard and access your classes
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
          {MOCK_COURSES.map((course) => (
            <button
              key={course.id}
              onClick={() => handleCourseSelect(course.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-blue-500 hover:bg-blue-50",
                selectedCourse === course.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 mt-1">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{course.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({course.code})
                    </span>
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

