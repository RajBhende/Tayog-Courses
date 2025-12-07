"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Clock, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleClassDialog } from "@/components/teacher/ScheduleClassDialog";
import { useSchedules } from "@/hooks/teacher/schedule/useSchedules";
import { format } from "date-fns";

export default function SchedulePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data: scheduleData = [], isLoading } = useSchedules();

  // Authentication check
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/teacher/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Class</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead className="w-[180px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-9 w-28 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a teacher
  if (status === "unauthenticated" || session?.user?.role !== "TEACHER") {
    return null;
  }

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
              <TableHead className="w-[180px]">Date & Time</TableHead>
              <TableHead className="w-[180px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-9 w-28 ml-auto" />
                </TableCell>
              </TableRow>
                ))}
              </>
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
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 w-fit">
                        {format(new Date(item.time), "MMM dd, yyyy")}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 w-fit border-blue-200">
                        {format(new Date(item.time), "hh:mm a")}
                      </Badge>
                    </div>
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
    </div>
  );
}
