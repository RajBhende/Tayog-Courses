import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function StudentUpcomingDeadlines() {
  return (
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
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">History of Thermodynamics</p>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Pending
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Due: 2023-11-15</p>
          </div>
        </div>
        <div className="relative pl-4 border-l-2 border-red-500">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">Calculus Worksheet 4</p>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Pending
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Due: 2023-11-20</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

