import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useCourseStore } from "@/lib/courseStore";
import type { SignupFormValues } from "@/validation/auth";

interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "TEACHER" | "STUDENT";
  };
}

export function useSignup() {
  const router = useRouter();
  const clearCourse = useCourseStore((state) => state.clearCourse);

  return useMutation({
    mutationFn: async (data: SignupFormValues): Promise<SignupResponse> => {
      const response = await api.post<SignupResponse>("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      return response.data;
    },
    onSuccess: async (data, variables) => {
      clearCourse();
      const result = await signIn("credentials", {
        email: data.user.email,
        password: variables.password,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();

        if (session?.user && session.user.role === data.user.role) {
          if (data.user.role === "TEACHER") {
            router.push("/teacher/lobby");
          } else {
            router.push("/student/lobby");
          }
          router.refresh();
        } else {
          router.push(
            data.user.role === "TEACHER" ? "/teacher/login" : "/student/login"
          );
        }
      } else {
        router.push(
          data.user.role === "TEACHER" ? "/teacher/login" : "/student/login"
        );
      }
    },
  });
}
