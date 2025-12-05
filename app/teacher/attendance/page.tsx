"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  initials: string;
  status: "Present" | "Absent";
}

const students: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    initials: "AJ",
    status: "Present",
  },
  {
    id: "2",
    name: "Bob Smith",
    initials: "BS",
    status: "Present",
  },
  {
    id: "3",
    name: "Charlie Brown",
    initials: "CB",
    status: "Present",
  },
  {
    id: "4",
    name: "Diana Prince",
    initials: "DP",
    status: "Present",
  },
];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    new Date(2025, 11, 4) // 04-12-2025
  );
  const [attendanceData, setAttendanceData] =
    React.useState<Student[]>(students);
  const [isSaving, setIsSaving] = React.useState(false);

  const toggleAttendance = (studentId: string) => {
    setAttendanceData((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status: student.status === "Present" ? "Absent" : "Present",
            }
          : student
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch("/api/attendance", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     date: format(selectedDate, "yyyy-MM-dd"),
      //     attendance: attendanceData,
      //   }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Attendance saved:", {
        date: format(selectedDate, "yyyy-MM-dd"),
        attendance: attendanceData,
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">
            Attendance
          </h1>
          <p className="text-muted-foreground mt-1">
            Track student presence
          </p>
        </div>

        {/* Date Picker and Save Button */}
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
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Student</TableHead>
              <TableHead className="w-[200px]">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              attendanceData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gray-200">
                          {student.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        student.status === "Present"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAttendance(student.id)}
                      className={
                        student.status === "Present"
                          ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      }
                    >
                      {student.status === "Present"
                        ? "Mark Absent"
                        : "Mark Present"}
                    </Button>
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
