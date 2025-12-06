"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  scheduleClassSchema,
  type ScheduleClassFormValues,
} from "@/validation/schedule";
import { useCreateSchedule } from "@/hooks/teacher/schedule/useCreateSchedule";

interface ScheduleClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleClassDialog({
  open,
  onOpenChange,
}: ScheduleClassDialogProps) {
  const { mutate: createSchedule, isPending: isLoading } = useCreateSchedule();

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = React.useState<string>("");

  const form = useForm<ScheduleClassFormValues>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      subject: "",
      time: "",
      topic: "",
      meetingLink: "",
    },
  });

  // Update form time field when date or time changes
  React.useEffect(() => {
    if (selectedDate && selectedTime) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const combinedDateTime = `${dateStr} ${selectedTime}`;
      form.setValue("time", combinedDateTime, { shouldValidate: true });
    } else {
      form.setValue("time", "", { shouldValidate: false });
    }
  }, [selectedDate, selectedTime, form]);

  // Watch form values to enable/disable submit button
  const watchedValues = form.watch();
  const isFormValid =
    watchedValues.subject?.trim().length >= 2 &&
    selectedDate !== undefined &&
    selectedTime?.trim().length > 0 &&
    watchedValues.topic?.trim().length >= 2 &&
    watchedValues.meetingLink?.trim().length > 0 &&
    watchedValues.meetingLink?.toLowerCase().startsWith("https://");

  const onSubmit = async (values: ScheduleClassFormValues) => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    // Combine date and time into "YYYY-MM-DD HH:MM" format
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const combinedDateTime = `${dateStr} ${selectedTime}`;

    createSchedule(
      {
        ...values,
        time: combinedDateTime,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          setSelectedDate(undefined);
          setSelectedTime("");
        },
        onError: (error) => {
          console.error("Error scheduling class:", error);
        },
      }
    );
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // Prevent closing dialog while loading
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
        setSelectedDate(undefined);
        setSelectedTime("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Subject */}
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

            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                  Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={isLoading}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>

              <FormItem>
                <FormLabel className="text-sm font-semibold uppercase tracking-wide">
                  Time
                </FormLabel>
                <FormControl>
                  <TimePicker
                    value={selectedTime}
                    onChange={setSelectedTime}
                    disabled={isLoading}
                    placeholder="Select time"
                  />
                </FormControl>
              </FormItem>
            </div>

            {/* Hidden field for validation */}
            <FormField
              control={form.control}
              name="time"
              render={() => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input
                      value={
                        selectedDate && selectedTime
                          ? `${format(selectedDate, "yyyy-MM-dd")} ${selectedTime}`
                          : ""
                      }
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  setSelectedDate(undefined);
                  setSelectedTime("");
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

