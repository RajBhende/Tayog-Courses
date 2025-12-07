"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCourseStore } from "@/lib/courseStore";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const inviteCoTeacherSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type InviteCoTeacherFormValues = z.infer<typeof inviteCoTeacherSchema>;

interface InviteCoTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteCoTeacherDialog({
  open,
  onOpenChange,
}: InviteCoTeacherDialogProps) {
  const { selectedCourseId } = useCourseStore();
  const queryClient = useQueryClient();

  const form = useForm<InviteCoTeacherFormValues>({
    resolver: zodResolver(inviteCoTeacherSchema),
    defaultValues: {
      email: "",
    },
  });

  const inviteCoTeacher = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.put("/teacher/co-teachers", {
        email,
        courseId: selectedCourseId,
      });
      return response.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "people", selectedCourseId] });
      form.reset();
      onOpenChange(false);
      alert(data.message || "Successfully invited co-teacher!");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || "Failed to invite co-teacher";
      form.setError("email", { message: errorMessage });
    },
  });

  const onSubmit = async (values: InviteCoTeacherFormValues) => {
    inviteCoTeacher.mutate(values.email);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!inviteCoTeacher.isPending) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
        form.clearErrors();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Co-Teacher</DialogTitle>
          <DialogDescription>
            Invite a teacher to collaborate on this course by entering their email address.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="teacher@example.com"
                      disabled={inviteCoTeacher.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                  form.clearErrors();
                }}
                disabled={inviteCoTeacher.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteCoTeacher.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {inviteCoTeacher.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Inviting...
                  </>
                ) : (
                  "Invite Co-Teacher"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

