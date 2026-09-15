/**
 * Module: GitHub Contribution Board (Activity Graph)
 * Path: src/components/widgets/github-contribution-board.tsx
 * 
 * Description:
 * Renders a GitHub-style heatmap (contribution graph) showing user activity over time.
 * Supports rendering multiple metrics (total activity, videos watched, learning hours, coding hours) and
 * allows filtering the timeframe (1M, 3M, 6M, 9M, 1Y).
 */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Clock, Code2, Layers, LayoutGrid, Flame } from "lucide-react";
import { formatLocalDate } from "@/lib/date-utils";

export type MetricType = "allHours" | "codingHours" | "learningHours" | "videos";

interface DayData {
  date: string; // YYYY-MM-DD
  videos: number;
  learningHours: number;
  codingHours: number;
  allHours?: number;
}

interface GitHubContributionBoardProps {
  initialData?: DayData[];
}

export default function GitHubContributionBoard({ initialData }: GitHubContributionBoardProps) {
  const [displayMode, setDisplayMode] = useState<"single" | "stacked">("single");
  const [activeMetric, setActiveMetric] = useState<MetricType>("allHours");
  const [timeRange, setTimeRange] = useState<number>(180); // 30, 90, 180, 270, 364
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    videos: number;
    learningHours: number;
    codingHours: number;
    allHours: number;
    x: number;
    y: number;
  } | null>(null);

  // Generate days based on timeRange in safe local calendar dates
  const days = useMemo(() => {
    const list: DayData[] = [];
    const today = new Date();
    const map = new Map<string, DayData>();

    if (initialData) {
      initialData.forEach((d) => map.set(d.date, d));
    }

    for (let i = timeRange; i >= 0; i--) {
      // Use local noon to prevent any midnight UTC timezone shifts
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 12, 0, 0);
      const dateStr = formatLocalDate(d);

      if (map.has(dateStr)) {
        const item = map.get(dateStr)!;
        list.push({
          ...item,
          allHours: item.allHours ?? parseFloat((item.learningHours + item.codingHours).toFixed(1)),
        });
      } else {
        list.push({
          date: dateStr,
          videos: 0,
          learningHours: 0,
          codingHours: 0,
          allHours: 0,
        });
      }
    }
    return list;
  }, [initialData, timeRange]);

  // Group days into weeks (columns of 7 days)
  const weeks = useMemo(() => {
    const res: DayData[][] = [];
    let currentWeek: DayData[] = [];

    days.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || idx === days.length - 1) {
        res.push(currentWeek);
        currentWeek = [];
      }
    });
    return res;
  }, [days]);

  // Intensity color calculators
  const getColor = (value: number, metric: MetricType) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/30";
    
    let level = 1;
    if (metric === "allHours") {
      if (value >= 6) level = 4;
      else if (value >= 4) level = 3;
      else if (value >= 2) level = 2;
      else level = 1;
    } else if (metric === "videos") {
      if (value >= 10) level = 4;
      else if (value >= 6) level = 3;
      else if (value >= 3) level = 2;
      else level = 1;
    } else if (metric === "learningHours") {
      if (value >= 5) level = 4;
      else if (value >= 3) level = 3;
      else if (value >= 1.5) level = 2;
      else level = 1;
    } else { // codingHours
      if (value >= 6) level = 4;
      else if (value >= 4) level = 3;
      else if (value >= 2) level = 2;
      else level = 1;
    }

    switch (level) {
      case 1:
        return "bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/40 text-emerald-900";
      case 2:
        return "bg-emerald-400 dark:bg-emerald-800 border border-emerald-500 dark:border-emerald-700";
      case 3:
        return "bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-500";
      case 4:
        return "bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-300";
      default:
        return "bg-gray-100 dark:bg-gray-800/60";
    }
  };

  const metricConfig: Record<
    MetricType,
    { title: string; icon: any; unit: string; description: string }
  > = {
    allHours: {
      title: "Total Activity",
      icon: Flame,
      unit: "hrs",
      description: "Total logged productive hours across all activities and learning",
    },
    codingHours: {
      title: "Coding Hours",
      icon: Code2,
      unit: "hrs",
      description: "Hours dedicated to programming, development, and tech projects",
    },
    learningHours: {
      title: "Learning Hours",
      icon: Clock,
      unit: "hrs",
      description: "Hours spent on courses, studying, reading, and research",
    },
    videos: {
      title: "Videos Watched",
      icon: Video,
      unit: "videos",
      description: "Number of course videos completed per day",
    },
  };

  // Render a single grid for a specific metric
  const renderGrid = (metric: MetricType) => {
    const config = metricConfig[metric];
    const Icon = config.icon;

    // Calculate totals & stats
    const total = days.reduce((acc, d) => acc + (d[metric] ?? 0), 0);
    const activeDays = days.filter((d) => (d[metric] ?? 0) > 0).length;

    return (
      <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{config.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div>
              <span className="text-gray-400">Total: </span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {metric === "videos" ? total : total.toFixed(1)} {config.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Active Days: </span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{activeDays} days</span>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
          <div className="inline-flex flex-col gap-1 min-w-max">
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const val = day[metric] ?? 0;
                    return (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-[2.5px] cursor-pointer transition-all duration-150 hover:scale-125 hover:z-10 ${getColor(
                          val,
                          metric
                        )}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            date: day.date,
                            videos: day.videos,
                            learningHours: day.learningHours,
                            codingHours: day.codingHours,
                            allHours: day.allHours ?? 0,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end space-x-2 pt-2 text-[11px] text-gray-400">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-950/80" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-800" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 dark:bg-emerald-600" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-900/90 shadow-sm border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Activity Contribution Board
          </CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            GitHub-style streak & effort visualization across activities, courses, and programming
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {/* Time Range Toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
            {[
              { label: "1M", val: 30 },
              { label: "3M", val: 90 },
              { label: "6M", val: 180 },
              { label: "9M", val: 270 },
              { label: "1Y", val: 364 },
            ].map((range) => (
              <button
                key={range.val}
                onClick={() => setTimeRange(range.val)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                  timeRange === range.val
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Display Mode: Single vs Stacked */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setDisplayMode("single")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                displayMode === "single"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
              title="Single view with tabs"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Single View</span>
            </button>
            <button
              onClick={() => setDisplayMode("stacked")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                displayMode === "stacked"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
              title="All stacked together"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stacked View</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayMode === "single" ? (
          <>
            {/* Metric Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              {(["allHours", "codingHours", "learningHours", "videos"] as MetricType[]).map((m) => {
                const conf = metricConfig[m];
                const Icon = conf.icon;
                const isActive = activeMetric === m;
                return (
                  <button
                    key={m}
                    onClick={() => setActiveMetric(m)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{conf.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Single Grid */}
            {renderGrid(activeMetric)}
          </>
        ) : (
          /* Stacked View: All grids vertically */
          <div className="space-y-4">
            {renderGrid("allHours")}
            {renderGrid("codingHours")}
            {renderGrid("learningHours")}
            {renderGrid("videos")}
          </div>
        )}

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 dark:bg-gray-950 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700"
            style={{ left: hoveredDay.x, top: hoveredDay.y - 8 }}
          >
            <div className="font-semibold text-emerald-400 mb-1">{hoveredDay.date}</div>
            <div className="space-y-0.5 text-[11px] text-gray-300">
              <div>⚡ Total Effort: <span className="font-medium text-white">{hoveredDay.allHours}h</span></div>
              <div>💻 Coding: <span className="font-medium text-white">{hoveredDay.codingHours}h</span></div>
              <div>⏱️ Learning: <span className="font-medium text-white">{hoveredDay.learningHours}h</span></div>
              <div>📺 Videos: <span className="font-medium text-white">{hoveredDay.videos}</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
