"use client";

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

interface LongTermViewProps {
  monthsCount: 3 | 6 | 9 | 12;
  recordsMap: Map<string, DayRecordData>;
  onSelectDay: (dateStr: string) => void;
}

export default function LongTermView({
  monthsCount,
  recordsMap,
  onSelectDay,
}: LongTermViewProps) {
  const todayStr = formatLocalDate(new Date());
  const currentDate = new Date();

  // Generate list of months starting from current month
  const months = Array.from({ length: monthsCount }, (_, mIdx) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + mIdx, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthName = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // First day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDay = new Date(year, month, 1).getDay();
    // Normalize to Monday = 0
    const startOffset = (firstDay + 6) % 7;

    const days = [];
    // Leading empty slots
    for (let i = 0; i < startOffset; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dObj = new Date(year, month, d, 12, 0, 0);
      const dateStr = formatLocalDate(dObj);
      const isToday = dateStr === todayStr;
      const record = recordsMap.get(dateStr);
      const hasActivity = record?.activityLogs && record.activityLogs.length > 0;
      const hasJournal = record?.journalEntries && record.journalEntries.length > 0;

      days.push({
        empty: false,
        dayNum: d,
        dateStr,
        isToday,
        hasActivity,
        hasJournal,
        key: dateStr,
      });
    }

    return {
      monthName,
      days,
    };
  });

  return (
    <div
      className={`grid gap-5 ${
        monthsCount === 3
          ? "grid-cols-1 md:grid-cols-3"
          : monthsCount === 6
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }`}
    >
      {months.map((m, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3 text-center">
            {m.monthName}
          </h4>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1.5">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>

          {/* Day squares */}
          <div className="grid grid-cols-7 gap-1">
            {m.days.map((d) => {
              if (d.empty) {
                return <div key={d.key} className="aspect-square" />;
              }

              return (
                <div
                  key={d.key}
                  onClick={() => onSelectDay(d.dateStr!)}
                  className={`aspect-square rounded-md text-[10px] font-semibold flex items-center justify-center cursor-pointer transition-all duration-150 ${
                    d.isToday
                      ? "ring-2 ring-emerald-500 font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : d.hasActivity
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
                      : d.hasJournal
                      ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200"
                      : "bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  title={`${d.dateStr}${d.isToday ? " (TODAY)" : ""}`}
                >
                  {d.dayNum}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
