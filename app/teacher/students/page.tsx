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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus } from "lucide-react";
import { EnrollStudentDialog } from "./enroll-student-dialog";

interface Student {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  email: string;
}

const students: Student[] = [
  {
    id: "1",
    studentId: "#001",
    name: "Alice Johnson",
    initials: "AJ",
    email: "alice@example.com",
  },
  {
    id: "2",
    studentId: "#002",
    name: "Bob Smith",
    initials: "BS",
    email: "bob@example.com",
  },
  {
    id: "3",
    studentId: "#003",
    name: "Charlie Brown",
    initials: "CB",
    email: "charlie@example.com",
  },
  {
    id: "4",
    studentId: "#004",
    name: "Diana Prince",
    initials: "DP",
    email: "diana@example.com",
  },
];

export default function StudentsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Student Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage enrollment and class roster
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll New Student
        </Button>
      </div>

      <EnrollStudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Students Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.studentId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {student.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {student.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Actions column - can add buttons here if needed */}
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
