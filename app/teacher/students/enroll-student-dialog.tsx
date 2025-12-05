"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  enrollStudentSchema,
  type EnrollStudentFormValues,
} from "@/validation/students";

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollStudentDialog({
  open,
  onOpenChange,
}: EnrollStudentDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<EnrollStudentFormValues>({
    resolver: zodResolver(enrollStudentSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // Watch form values to enable/disable submit button
  const watchedValues = form.watch();
  const isFormValid =
    watchedValues.fullName?.trim().length >= 2 &&
    watchedValues.email?.trim().length > 0 &&
    watchedValues.email?.includes("@");

  const onSubmit = async (values: EnrollStudentFormValues) => {
    setIsLoading(true);
    try {
      console.log("Form values:", values);

      // TODO: Replace with actual API call
      // const response = await fetch("/api/students/enroll", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(values),
      // });
      // if (!response.ok) throw new Error("Failed to enroll student");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Only close dialog after successful submission
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error enrolling student:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // Prevent closing dialog while loading
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name and Email Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. John Doe"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. john@university.edu"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer Buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Enrolling...
                  </>
                ) : (
                  "Enroll"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

