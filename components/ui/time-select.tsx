"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Generate time slots (48 slots = 24 hours with 30-minute intervals)
export const generateTimeSlots = () => {
  return Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute} ${ampm}`;
  });
};

export const timeSlots = generateTimeSlots();

interface TimeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

/**
 * Reusable Time Select Component using Shadcn UI Select
 *
 * Generates 48 time slots (30-minute intervals) in 12-hour format with AM/PM.
 *
 * Usage:
 * ```tsx
 * const [selectedTime, setSelectedTime] = useState<string>("");
 *
 * <TimeSelect
 *   value={selectedTime}
 *   onValueChange={setSelectedTime}
 *   label="Select Time"
 *   placeholder="Choose a time"
 * />
 * ```
 */
export const TimeSelect: React.FC<TimeSelectProps> = ({
  value = "",
  onValueChange,
  placeholder = "Select time",
  className = "",
  label,
  required = false,
  disabled = false,
  id,
}) => {
  const selectId = id || "time-select";

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label htmlFor={selectId} className="text-sm font-semibold uppercase tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          id={selectId}
          className="w-full"
          aria-label={label || "Select time"}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {timeSlots.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelect;

