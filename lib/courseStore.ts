import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course } from "@/types";

type Role = "TEACHER" | "STUDENT";

interface CourseStore {
  selectedCourseId: string | null;
  selectedCourse: Course | null;
  role: Role | null;
  hasShownDialog: boolean;
  setSelectedCourse: (course: Course, role: Role) => void;
  setHasShownDialog: (hasShown: boolean) => void;
  clearCourse: () => void;
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      selectedCourseId: null,
      selectedCourse: null,
      role: null,
      hasShownDialog: false,
      setSelectedCourse: (course, role) =>
        set({
          selectedCourseId: course.id,
          selectedCourse: course,
          role,
        }),
      setHasShownDialog: (hasShown) => set({ hasShownDialog: hasShown }),
      clearCourse: () =>
        set({
          selectedCourseId: null,
          selectedCourse: null,
          role: null,
          hasShownDialog: false,
        }),
    }),
    {
      name: "course-storage",
      partialize: (state) => ({
        selectedCourseId: state.selectedCourseId,
        selectedCourse: state.selectedCourse,
        role: state.role,
        hasShownDialog: state.hasShownDialog,
      }),
    }
  )
);
