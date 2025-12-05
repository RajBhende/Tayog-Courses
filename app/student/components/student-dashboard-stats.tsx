import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";

export function StudentDashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
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
    </div>
  );
}

