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
import { TimePicker } from "@/components/ui/time-picker";
import {
  scheduleClassSchema,
  type ScheduleClassFormValues,
} from "@/validation/schedule";

interface ScheduleClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleClassDialog({
  open,
  onOpenChange,
}: ScheduleClassDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ScheduleClassFormValues>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      subject: "",
      time: "",
      topic: "",
      meetingLink: "",
    },
  });

  // Watch form values to enable/disable submit button
  const watchedValues = form.watch();
  const isFormValid =
    watchedValues.subject?.trim().length >= 2 &&
    watchedValues.time?.trim().length > 0 &&
    watchedValues.topic?.trim().length >= 2 &&
    watchedValues.meetingLink?.trim().length > 0 &&
    watchedValues.meetingLink?.toLowerCase().startsWith("https://");

  const onSubmit = async (values: ScheduleClassFormValues) => {
    setIsLoading(true);
    try {
      console.log("Form values:", values);
      
      // TODO: Replace with actual API call
      // Example API call:
      // const response = await fetch("/api/schedule", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(values),
      // });
      // if (!response.ok) throw new Error("Failed to schedule class");
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Only close dialog after successful submission
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error scheduling class:", error);
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
            {/* Subject and Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Subject (e.g. Physics)"
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
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Time
                    </FormLabel>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        placeholder="--:--"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Topic and Meeting Link Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Topic
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Topic"
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
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                      Meeting Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meet.google.com/xyz-abc-def"
                        type="url"
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
                    Adding...
                  </>
                ) : (
                  "Add to Schedule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

