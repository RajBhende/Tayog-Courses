"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  placeholder = "--:--",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState("12");
  const [minutes, setMinutes] = React.useState("00");
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

  React.useEffect(() => {
    if (open && value) {
      // Parse value when popover opens
      const [h, m] = value.split(":");
      if (h && m) {
        let hour24 = parseInt(h, 10);
        const min = m.padStart(2, "0");
        
        if (hour24 === 0) {
          setHours("12");
          setPeriod("AM");
        } else if (hour24 < 12) {
          setHours(hour24.toString());
          setPeriod("AM");
        } else if (hour24 === 12) {
          setHours("12");
          setPeriod("PM");
        } else {
          setHours((hour24 - 12).toString());
          setPeriod("PM");
        }
        setMinutes(min);
      }
    }
  }, [open, value]);

  const handleTimeChange = () => {
    let hour24 = parseInt(hours, 10);
    
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, "0")}:${minutes}`;
    onChange(timeString);
    setOpen(false);
  };

  const displayValue = value
    ? (() => {
        const [h, m] = value.split(":");
        if (!h || !m) return placeholder;
        let hour24 = parseInt(h, 10);
        let hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? "PM" : "AM";
        return `${hour12}:${m} ${period}`;
      })()
    : placeholder;

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-4">
          {/* Hours */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Hour
            </label>
            <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
              {hoursList.map((h) => (
                <Button
                  key={h}
                  variant={hours === h ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-10 p-0"
                  onClick={() => setHours(h)}
                >
                  {parseInt(h, 10)}
                </Button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Minute
            </label>
            <div className="grid grid-cols-5 gap-1 max-h-32 overflow-y-auto">
              {minutesList
                .filter((m) => parseInt(m, 10) % 5 === 0)
                .map((m) => (
                  <Button
                    key={m}
                    variant={minutes === m ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 p-0 text-xs"
                    onClick={() => setMinutes(m)}
                  >
                    {m}
                  </Button>
                ))}
            </div>
          </div>

          {/* AM/PM */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Period
            </label>
            <div className="flex flex-col gap-1">
              <Button
                variant={period === "AM" ? "default" : "outline"}
                size="sm"
                className="w-12"
                onClick={() => setPeriod("AM")}
              >
                AM
              </Button>
              <Button
                variant={period === "PM" ? "default" : "outline"}
                size="sm"
                className="w-12"
                onClick={() => setPeriod("PM")}
              >
                PM
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleTimeChange}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

