import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Users, Clock, Video } from "lucide-react";

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Prof. Smith!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is what's happening in your classroom today.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">2</CardTitle>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">2</CardTitle>
                <p className="text-sm text-muted-foreground">Upcoming Classes</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">4</CardTitle>
                <p className="text-sm text-muted-foreground">Enrolled Students</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Bottom Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Upcoming Deadlines</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative pl-4 border-l-2 border-red-500">
              <div className="space-y-1">
                <p className="font-semibold">History of Thermodynamics</p>
                <p className="text-sm text-muted-foreground">Due: 2023-11-15</p>
              </div>
            </div>
            <div className="relative pl-4 border-l-2 border-red-500">
              <div className="space-y-1">
                <p className="font-semibold">Calculus Worksheet 4</p>
                <p className="text-sm text-muted-foreground">Due: 2023-11-20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Live Class */}
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
                  <p className="text-sm text-blue-100">10:00 AM Today</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Physics</h3>
                  <p className="text-blue-100">Kinematics</p>
                </div>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Join Classroom
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
