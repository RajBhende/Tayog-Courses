"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useSchedules } from "@/hooks/student/schedule/useSchedules";
import { format } from "date-fns";

interface StudentNextClassProps {
  courseId?: string | null;
}

export function StudentNextClass({ courseId }: StudentNextClassProps) {
  const { data: schedules = [], isLoading } = useSchedules();

  const now = new Date();
  const upcomingSchedules = schedules
    .filter((s) => new Date(s.time) >= now)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
  const nextClass = upcomingSchedules[0];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <CardTitle>Next Live Class</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!nextClass) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <CardTitle>Next Live Class</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No upcoming classes</div>
        </CardContent>
      </Card>
    );
  }

  const classDate = new Date(nextClass.time);
  const isToday = classDate.toDateString() === now.toDateString();
  const timeDisplay = isToday 
    ? `${format(classDate, "hh:mm a")} Today`
    : format(classDate, "hh:mm a, MMM dd");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <CardTitle>Next Live Class</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative bg-blue-600 rounded-lg p-6 text-white">
          <div className="absolute top-4 right-4">
            <Video className="h-5 w-5 text-white/80" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-blue-100">{timeDisplay}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">{nextClass.subject}</h3>
              <p className="text-blue-100">{nextClass.topic}</p>
            </div>
            <Button 
              className="w-full bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.open(nextClass.meetingLink, '_blank')}
            >
              Join Classroom
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

