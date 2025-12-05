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
import { Plus, Clock, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleClassDialog } from "./schedule-class-dialog";

interface ScheduleItem {
  id: string;
  className: string;
  topic: string;
  time: string;
}

const scheduleData: ScheduleItem[] = [
  {
    id: "1",
    className: "Mathematics",
    topic: "Derivatives",
    time: "02:00 PM",
  },
  {
    id: "2",
    className: "Physics",
    topic: "Kinematics",
    time: "10:00 AM",
  },
];

export default function SchedulePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Upcoming lectures and events
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Class
        </Button>
      </div>

      <ScheduleClassDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Table */}
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
            {scheduleData.length === 0 ? (
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
                      <span className="font-semibold">{item.className}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-muted-foreground">{item.topic}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">
                      {item.time}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
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
    </div>
  );
}
