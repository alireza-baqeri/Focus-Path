"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import WeekView from "./week-view";
import MonthView from "./month-view";
import LongTermView from "./long-term-view";
import ActivityChart from "./activity-chart";
import DailyJournalModal from "./daily-journal-modal";
import GoalManagerModal from "./goal-manager-modal";
import { Button } from "@/components/ui/button";
import { formatLocalDate } from "@/lib/date-utils";

export type ViewType = "7days" | "28days" | "3months" | "6months" | "9months" | "1year";

export default function TimetableContainer() {
  const [activeView, setActiveView] = useState<ViewType>("28days");
  const [currentStartDate, setCurrentStartDate] = useState<Date>(() => {
    // Start from beginning of current week (Monday) at local noon
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff, 12, 0, 0);
    return monday;
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [dayRecords, setDayRecords] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Fetch timetable data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/timetable");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setGoals(data.goals || []);
        setDayRecords(data.dayRecords || []);
        setUserSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to load timetable data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Records Map for O(1) lookups: DateStr -> DayRecord
  const recordsMap = useMemo(() => {
    const map = new Map<string, any>();
    dayRecords.forEach((r) => {
      const dateStr = formatLocalDate(r.date);
      map.set(dateStr, r);
    });
    return map;
  }, [dayRecords]);

  // Compute dates array for the chart based on active view
  const activeDates = useMemo(() => {
    const count = activeView === "7days" ? 7 : 28;
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(currentStartDate);
      d.setDate(d.getDate() + i);
      list.push(formatLocalDate(d));
    }
    return list;
  }, [currentStartDate, activeView]);

  // Date Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentStartDate);
    if (activeView === "7days") {
      d.setDate(d.getDate() - 7);
    } else if (activeView === "28days") {
      d.setDate(d.getDate() - 28);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentStartDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentStartDate);
    if (activeView === "7days") {
      d.setDate(d.getDate() + 7);
    } else if (activeView === "28days") {
      d.setDate(d.getDate() + 28);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentStartDate(d);
  };

  const handleToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff, 12, 0, 0);
    setCurrentStartDate(monday);
  };

  // Save Day Record (Journal, Activity, Goal)
  const handleSaveDayRecord = async (payload: any) => {
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      // Update local state immediately
      setDayRecords((prev) => {
        const dateStr = formatLocalDate(updated.date);
        const existingIdx = prev.findIndex(
          (r) => formatLocalDate(r.date) === dateStr
        );
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    }
  };

  // Goal & Category Handlers
  const handleAddGoal = async (goalData: any) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalData),
    });
    if (res.ok) {
      const newGoal = await res.json();
      setGoals((prev) => [newGoal, ...prev]);
    } else {
      const err = await res.json();
      throw new Error(err.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleAddCategory = async (catData: any) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catData),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories((prev) => [...prev, newCat]);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const selectedRecord = selectedDateStr ? recordsMap.get(selectedDateStr) : null;

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Left: Back & Navigation */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Time Table & Journal
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track your days, sleep cycle, and activity performance
            </p>
          </div>
        </div>

        {/* Middle: Prev, Today, Next */}
        <div className="flex items-center gap-1.5 self-center">
          <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 px-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-semibold">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} className="h-8 px-2">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-2">
            {currentStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" — "}
            {(() => {
              const end = new Date(currentStartDate);
              end.setDate(end.getDate() + (activeView === "7days" ? 6 : 27));
              return end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            })()}
          </span>
        </div>

        {/* Right: View switcher & Goal Manager */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/80 p-1 border border-gray-200 dark:border-gray-700/60">
            {(
              [
                { id: "7days", label: "Week (7d)" },
                { id: "28days", label: "Month (28d)" },
                { id: "3months", label: "3M" },
                { id: "6months", label: "6M" },
                { id: "9months", label: "9M" },
                { id: "1year", label: "1Y" },
              ] as { id: ViewType; label: string }[]
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeView === v.id
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-8 rounded-xl"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Targets & Tags ({goals.length}/3)</span>
          </Button>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center text-sm text-gray-500">
          Loading timetable...
        </div>
      ) : (
        <div className="space-y-6">
          {activeView === "7days" && (
            <WeekView
              startDate={currentStartDate}
              recordsMap={recordsMap}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
            />
          )}

          {activeView === "28days" && (
            <MonthView
              startDate={currentStartDate}
              recordsMap={recordsMap}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
            />
          )}

          {activeView === "3months" && (
            <LongTermView
              monthsCount={3}
              recordsMap={recordsMap}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
            />
          )}

          {activeView === "6months" && (
            <LongTermView
              monthsCount={6}
              recordsMap={recordsMap}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
            />
          )}

          {activeView === "9months" && (
            <LongTermView
              monthsCount={9}
              recordsMap={recordsMap}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
            />
          )}

          {activeView === "1year" && (
            <LongTermView
              monthsCount={12}
              recordsMap={recordsMap}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
            />
          )}

          {/* Activity Breakdown Chart beneath Calendar */}
          <ActivityChart
            dates={activeDates}
            recordsMap={recordsMap}
            categories={categories}
          />
        </div>
      )}

      {/* Daily Journal & Planner Modal */}
      {selectedDateStr && (
        <DailyJournalModal
          isOpen={true}
          onClose={() => setSelectedDateStr(null)}
          dateStr={selectedDateStr}
          dayRecord={selectedRecord}
          categories={categories}
          goals={goals}
          onSave={handleSaveDayRecord}
          quoteCategory={userSettings?.quoteCategory || "inspire"}
        />
      )}

      {/* Goal & Category Manager Modal */}
      <GoalManagerModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goals={goals}
        categories={categories}
        onAddGoal={handleAddGoal}
        onDeleteGoal={handleDeleteGoal}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
