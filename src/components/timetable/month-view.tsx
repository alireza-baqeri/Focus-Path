"use client";

import { Sun, Moon, Edit3 } from "lucide-react";
import { formatLocalDate } from "@/lib/date-utils";

interface DayRecordData {
  id?: string;
  date: string;
  wakeTime?: string | null;
  sleepTime?: string | null;
  journalEntries?: { content: string; orderIndex: number }[];
  activityLogs?: { durationMinutes: number; category: { emoji: string; name: string } }[];
  goalProgresses?: { description: string; goal: { title: string } }[];
}

interface MonthViewProps {
  startDate: Date; // Start date of the 28-day cycle
  recordsMap: Map<string, DayRecordData>;
  onSelectDay: (dateStr: string) => void;
}

export default function MonthView({ startDate, recordsMap, onSelectDay }: MonthViewProps) {
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate 28 days (4 weeks x 7 days)
  const todayStr = formatLocalDate(new Date());
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = formatLocalDate(d);
    const isToday = dateStr === todayStr;
    return {
      date: d,
      dateStr,
      isToday,
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString("en-US", { month: "short" }),
      record: recordsMap.get(dateStr),
    };
  });

  return (
    <div className="w-full flex flex-col rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Weekday Column Headers (7 vertical columns) */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 28 Rectangles Grid (4 rows x 7 columns) */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
        {days.map((day) => {
          const hasRecord =
            day.record &&
            ((day.record.journalEntries && day.record.journalEntries.length > 0) ||
              (day.record.activityLogs && day.record.activityLogs.length > 0));

          return (
            <div
              key={day.dateStr}
              onClick={() => onSelectDay(day.dateStr)}
              className={`group relative min-h-[110px] p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-150 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 ${
                day.isToday
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500 ring-inset"
                  : "bg-white dark:bg-gray-900"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-sm font-bold ${
                      day.isToday
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{day.monthName}</span>
                </div>

                {day.isToday && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    TODAY
                  </span>
                )}
              </div>

              {/* Day Content / Snippets */}
              <div className="my-1.5 space-y-1 flex-1 overflow-hidden">
                {/* Wake / Sleep pill */}
                {day.record?.wakeTime && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    <Sun className="w-2.5 h-2.5 text-amber-500" />
                    <span>{day.record.wakeTime}</span>
                  </div>
                )}

                {/* Activity badges */}
                {day.record?.activityLogs && day.record.activityLogs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {day.record.activityLogs.slice(0, 3).map((act, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        title={`${act.category.name}: ${act.durationMinutes}m`}
                      >
                        {act.category.emoji} {Math.round(act.durationMinutes / 60)}h
                      </span>
                    ))}
                    {day.record.activityLogs.length > 3 && (
                      <span className="text-[9px] text-gray-400 font-semibold self-center">
                        +{day.record.activityLogs.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Journal snippet */}
                {day.record?.journalEntries && day.record.journalEntries.length > 0 && (
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 italic">
                    • {day.record.journalEntries[0].content}
                  </p>
                )}
              </div>

              {/* Hover Edit Action */}
              <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  <Edit3 className="w-3 h-3" /> Edit
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
