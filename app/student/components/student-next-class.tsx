import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export function StudentNextClass() {
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
  );
}

