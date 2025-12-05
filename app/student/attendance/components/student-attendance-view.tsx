"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent";
}

const attendanceRecords: AttendanceRecord[] = [
  {
    date: "2023-11-01",
    status: "Present",
  },
  {
    date: "2023-11-02",
    status: "Present",
  },
  {
    date: "2023-11-03",
    status: "Absent",
  },
  {
    date: "2023-11-04",
    status: "Present",
  },
];

export function StudentAttendanceView() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  const presentCount = attendanceRecords.filter(
    (record) => record.status === "Present"
  ).length;
  const totalCount = attendanceRecords.length;
  const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Classes</div>
          <div className="text-2xl font-bold">{totalCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-1">Present</div>
          <div className="text-2xl font-bold text-green-600">{presentCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground mb-1">Attendance Rate</div>
          <div className="text-2xl font-bold">{attendanceRate.toFixed(0)}%</div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "dd-MM-yyyy")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Attendance Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              attendanceRecords.map((record) => (
                <TableRow key={record.date}>
                  <TableCell className="font-medium">
                    {format(new Date(record.date), "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        record.status === "Present"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

