"use client"
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NoDataProps {
  message?: string;
}

export default function NoData({ message = "No data to display" }: NoDataProps) {
  return (
    <Card className="flex items-center justify-center h-full text-center">
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground text-md">{message}</p>
      </CardContent>
    </Card>
  );
}
