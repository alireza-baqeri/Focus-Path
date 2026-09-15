"use client";

import { useState } from "react";
import { Timer } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import PomodoroTimer from "./pomodoro-timer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function PomodoroModal() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleComplete = async (durationSeconds: number) => {
    if (!session?.user?.id) return;
    
    // Convert to minutes, minimum 1 minute
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
    
    try {
      // We will create a simple endpoint to log just a single activity
      // rather than posting the whole timetable day record.
      const res = await fetch("/api/timetable/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes,
          categoryName: "Focus", // Default category for Pomodoro
          date: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        // We could show a toast here
        router.refresh(); // Refresh dashboard
      }
    } catch (error) {
      console.error("Failed to log pomodoro activity:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors focus:outline-none" title="Pomodoro Timer">
        <Timer className="w-5 h-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
        <DialogTitle className="sr-only">Pomodoro Timer</DialogTitle>
        <PomodoroTimer onComplete={handleComplete} />
      </DialogContent>
    </Dialog>
  );
}
