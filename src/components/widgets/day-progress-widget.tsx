"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Clock } from "lucide-react";

export default function DayProgressWidget() {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateProgress = () => {
      const now = new Date();
      const secondsSinceMidnight = 
        now.getHours() * 3600 + 
        now.getMinutes() * 60 + 
        now.getSeconds();
      const percent = (secondsSinceMidnight / 86400) * 100;
      setProgress(percent);
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDay = progress > 25 && progress < 75; // Roughly 6am to 6pm

  if (!mounted) {
    return <div className="w-40 h-10 bg-transparent"></div>;
  }

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm shadow-black/5">
      {isDay ? (
        <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
      ) : (
        <Moon className="w-4 h-4 text-blue-400" />
      )}
      <div className="flex flex-col">
        <div className="flex justify-between items-center w-32 mb-1">
          <span className="text-[10px] font-bold uppercase text-gray-500">Today</span>
          <span className="text-[10px] font-bold font-mono text-gray-800 dark:text-gray-200">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-32 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
