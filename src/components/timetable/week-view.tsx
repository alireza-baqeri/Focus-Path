"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, Moon, Sun, CheckCircle2, ChevronRight, Edit3 } from "lucide-react";
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

interface WeekViewProps {
  startDate: Date; // Start of the 7-day period
  recordsMap: Map<string, DayRecordData>;
  onSelectDay: (dateStr: string) => void;
}

export default function WeekView({ startDate, recordsMap, onSelectDay }: WeekViewProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Generate 7 days starting from startDate
  const todayStr = formatLocalDate(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = formatLocalDate(d);
    const isToday = dateStr === todayStr;
    return {
      date: d,
      dateStr,
      isToday,
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString("en-US", { month: "short" }),
      record: recordsMap.get(dateStr),
    };
  });

  const handleCardClick = (index: number, dateStr: string) => {
    if (expandedIndex === index) {
      // Toggle off
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className="w-full h-[540px] flex gap-2.5 overflow-hidden p-2 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200/80 dark:border-gray-800">
      {days.map((day, idx) => {
        const isExpanded = expandedIndex === idx;
        const hasData =
          day.record &&
          ((day.record.journalEntries && day.record.journalEntries.length > 0) ||
            (day.record.activityLogs && day.record.activityLogs.length > 0));

        return (
          <motion.div
            key={day.dateStr}
            layout
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={() => handleCardClick(idx, day.dateStr)}
            className={`relative flex flex-col h-full rounded-xl cursor-pointer select-none transition-shadow overflow-hidden border ${
              isExpanded
                ? "flex-[2.4] bg-white dark:bg-gray-900 border-blue-500/80 dark:border-blue-500 shadow-xl ring-2 ring-blue-500/20"
                : expandedIndex !== null
                ? "flex-[0.75] bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800/80 hover:bg-white dark:hover:bg-gray-900"
                : "flex-1 bg-white dark:bg-gray-900/90 border-gray-200/90 dark:border-gray-800 hover:border-blue-400/60 dark:hover:border-blue-500/60 shadow-sm"
            } ${day.isToday ? "border-l-4 border-l-emerald-500 dark:border-l-emerald-400" : ""}`}
          >
            {/* Header */}
            <div
              className={`p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors ${
                day.isToday
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                  : isExpanded
                  ? "bg-blue-50/40 dark:bg-blue-950/20"
                  : ""
              }`}
            >
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                  {day.dayName}
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-xl font-bold ${
                      day.isToday
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{day.monthName}</span>
                </div>
              </div>

              {day.isToday && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  TODAY
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 p-3.5 flex flex-col justify-between overflow-y-auto scrollbar-none text-xs">
              {/* If expanded, show rich details */}
              {isExpanded ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Wake / Sleep times */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <div className="text-gray-400 text-[10px]">Wake</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-200">
                          {day.record?.wakeTime || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <div className="text-gray-400 text-[10px]">Sleep</div>
                        <div className="font-semibold text-gray-700 dark:text-gray-200">
                          {day.record?.sleepTime || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities summary */}
                  {day.record?.activityLogs && day.record.activityLogs.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Activities
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {day.record.activityLogs.map((act, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 text-[11px]"
                          >
                            <span>{act.category.emoji}</span>
                            <span>{act.category.name}</span>
                            <span className="font-bold">({Math.round(act.durationMinutes / 60)}h)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Journal Entries */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Journal & Completed
                    </div>
                    {day.record?.journalEntries && day.record.journalEntries.length > 0 ? (
                      <div className="space-y-1">
                        {day.record.journalEntries.map((j, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300 text-[11px]"
                          >
                            <span className="text-gray-400 font-bold mt-0.5">{i + 1}.</span>
                            <span className="line-clamp-2">{j.content}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic text-[11px]">No journal entries yet.</div>
                    )}
                  </div>

                  {/* Goal Progress */}
                  {day.record?.goalProgresses && day.record.goalProgresses.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Goal Contribution
                      </div>
                      <div className="space-y-1">
                        {day.record.goalProgresses.map((gp, i) => (
                          <div
                            key={i}
                            className="p-1.5 rounded bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-[11px]"
                          >
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {gp.goal.title}:
                            </span>{" "}
                            <span className="text-gray-700 dark:text-gray-300">{gp.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Compact / collapsed preview */
                <div className="space-y-2">
                  {day.record?.wakeTime && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>{day.record.wakeTime}</span>
                    </div>
                  )}

                  {day.record?.activityLogs && day.record.activityLogs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {day.record.activityLogs.map((act, i) => (
                        <span key={i} title={`${act.category.name}: ${act.durationMinutes}m`}>
                          {act.category.emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {day.record?.journalEntries && day.record.journalEntries.length > 0 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-3">
                      {day.record.journalEntries[0].content}
                    </div>
                  )}
                </div>
              )}

              {/* Action button at bottom */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDay(day.dateStr);
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isExpanded
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isExpanded ? "Open Full Journal" : "Edit"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
