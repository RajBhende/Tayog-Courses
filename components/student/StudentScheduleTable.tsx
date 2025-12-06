"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Video } from "lucide-react";
import { useSchedules } from "@/hooks/student/schedule/useSchedules";
import { format } from "date-fns";

export function StudentScheduleTable() {
  const { data: scheduleData = [], isLoading } = useSchedules();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Class</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead className="w-[150px]">Time</TableHead>
            <TableHead className="w-[180px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Loading schedules...
              </TableCell>
            </TableRow>
          ) : scheduleData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No scheduled classes found.
              </TableCell>
            </TableRow>
          ) : (
            scheduleData.map((item) => (
              <TableRow
                key={item.id}
                className="border-l-4 border-l-blue-500 bg-gray-50/50"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-semibold">{item.subject}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-muted-foreground">{item.topic}</span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">
                    {format(new Date(item.time), "hh:mm a")}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(item.meetingLink, '_blank')}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Class
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

