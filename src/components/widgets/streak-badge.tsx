"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { usePathname } from "next/navigation";

export function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchStreak() {
      try {
        const res = await fetch("/api/user/streak", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStreak(data.streak);
        }
      } catch (err) {
        console.error("Failed to fetch streak:", err);
      }
    }
    fetchStreak();
  }, [pathname]);

  if (streak === null || streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-500 font-medium text-sm shadow-sm transition-all hover:scale-105" title={`${streak} Days Streak`}>
      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
      <span>{streak}</span>
    </div>
  );
}
