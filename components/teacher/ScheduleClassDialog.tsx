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
import TimeSelect from "@/components/ui/time-select";
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
  const [selectedTimeDisplay, setSelectedTimeDisplay] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  // Convert 12-hour format (e.g., "12:00 PM") to 24-hour format (e.g., "12:00")
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "";
    const [time, period] = time12h.split(" ");
    if (!time || !period) return "";
    
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours, 10);
    
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24-hour format (e.g., "12:00") to 12-hour format (e.g., "12:00 PM")
  const convertTo12Hour = (time24h: string): string => {
    if (!time24h) return "";
    const [hours, minutes] = time24h.split(":");
    if (!hours || !minutes) return "";
    
    let hour24 = parseInt(hours, 10);
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const displayHour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle time selection from TimeSelect
  const handleTimeChange = (time12h: string) => {
    setSelectedTimeDisplay(time12h);
    const time24h = convertTo24Hour(time12h);
    setSelectedTime(time24h);
  };

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

  // Initialize display time when selectedTime changes from external source
  React.useEffect(() => {
    if (selectedTime && !selectedTimeDisplay) {
      setSelectedTimeDisplay(convertTo12Hour(selectedTime));
    }
  }, [selectedTime]);

  // Watch form values to enable/disable submit button
  const watchedValues = form.watch();
  const formErrors = form.formState.errors;
  
  const isFormValid =
    watchedValues.subject?.trim().length >= 2 &&
    selectedDate !== undefined &&
    selectedTime?.trim().length > 0 &&
    watchedValues.topic?.trim().length >= 2 &&
    watchedValues.meetingLink?.trim().length > 0 &&
    watchedValues.meetingLink?.toLowerCase().startsWith("https://");

  // Debug form state
  React.useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      console.log("Form errors:", formErrors);
    }
    console.log("Form validity:", {
      isFormValid,
      subject: watchedValues.subject?.trim().length,
      selectedDate: !!selectedDate,
      selectedTime: selectedTime?.trim().length,
      topic: watchedValues.topic?.trim().length,
      meetingLink: watchedValues.meetingLink?.trim().length,
      meetingLinkValid: watchedValues.meetingLink?.toLowerCase().startsWith("https://"),
    });
  }, [isFormValid, formErrors, watchedValues, selectedDate, selectedTime]);

  const onSubmit = async (values: ScheduleClassFormValues) => {
    setError(null);
    
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    // Combine date and time into "YYYY-MM-DD HH:MM" format
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const combinedDateTime = `${dateStr} ${selectedTime}`;

    console.log("Submitting schedule:", {
      ...values,
      time: combinedDateTime,
    });

    createSchedule(
      {
        ...values,
        time: combinedDateTime,
      },
      {
        onSuccess: () => {
          console.log("Schedule created successfully");
          onOpenChange(false);
          form.reset();
          setSelectedDate(undefined);
          setSelectedTime("");
          setSelectedTimeDisplay("");
          setError(null);
        },
        onError: (error: unknown) => {
          console.error("Error scheduling class:", error);
          let errorMessage = "Failed to schedule class. Please try again.";
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as { response?: { data?: { error?: string; details?: string } } };
            errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.details || errorMessage;
          }
          
          setError(errorMessage);
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
        setSelectedTimeDisplay("");
        setError(null);
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
                <FormControl>
                  <TimeSelect
                    value={selectedTimeDisplay}
                    onValueChange={handleTimeChange}
                    disabled={isLoading}
                    placeholder="Select time"
                    label="Time"
                    required
                  />
                </FormControl>
              </FormItem>
            </div>

            {/* Hidden field for validation */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input
                      {...field}
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
            
            {/* Show time validation error if exists */}
            {form.formState.errors.time && (
              <div className="text-sm text-destructive">
                {form.formState.errors.time.message}
              </div>
            )}
            
            {/* Show general error message */}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

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
                  setSelectedTimeDisplay("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                onClick={(e) => {
                  if (!isFormValid) {
                    e.preventDefault();
                    console.log("Form is not valid, preventing submission");
                    form.trigger(); // Trigger validation to show errors
                    return;
                  }
                }}
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

