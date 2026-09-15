"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ActivityCategory {
  id: string;
  name: string;
  emoji: string;
  colorCode: string;
}

interface DayRecordData {
  date: string;
  activityLogs?: { durationMinutes: number; category: { id: string; name: string; emoji: string; colorCode: string } }[];
}

interface ActivityChartProps {
  dates: string[]; // List of date strings in current view (e.g. 28 days or 7 days)
  recordsMap: Map<string, DayRecordData>;
  categories: ActivityCategory[];
}

export default function ActivityChart({ dates, recordsMap, categories }: ActivityChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Transform records into Recharts data
  const chartData = useMemo(() => {
    return dates.map((dateStr) => {
      const d = new Date(dateStr + "T12:00:00");
      const label = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
      const record = recordsMap.get(dateStr);

      const entry: any = {
        date: label,
        fullDate: dateStr,
        totalHours: 0,
      };

      // Initialize all categories with 0 hours
      categories.forEach((cat) => {
        entry[cat.name] = 0;
      });

      if (record?.activityLogs) {
        record.activityLogs.forEach((log) => {
          const cat = categories.find((c) => c.id === log.category.id) || log.category;
          const hours = parseFloat((log.durationMinutes / 60).toFixed(1));
          entry[cat.name] = (entry[cat.name] || 0) + hours;
          entry.totalHours += hours;
        });
      }

      entry.totalHours = parseFloat(entry.totalHours.toFixed(1));
      return entry;
    });
  }, [dates, recordsMap, categories]);

  // Color palette for categories
  const categoryColors: Record<string, string> = {
    Programming: "#3b82f6", // Blue
    University: "#8b5cf6", // Purple
    Sports: "#10b981", // Emerald
    Reading: "#f59e0b", // Amber
    Rest: "#6b7280", // Gray
  };

  const getCatColor = (cat: ActivityCategory, index: number) => {
    if (cat.colorCode) return cat.colorCode;
    if (categoryColors[cat.name]) return categoryColors[cat.name];
    const fallbackPalette = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"];
    return fallbackPalette[index % fallbackPalette.length];
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">Activity Duration Breakdown</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hours spent per category over the selected timeframe ({dates.length} days)
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
            }`}
          >
            All Activities
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                selectedCategory === cat.name
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.95)",
                  borderColor: "#374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              />

              {/* Render Bars based on selected filter */}
              {selectedCategory === "all" ? (
                categories.map((cat, idx) => (
                  <Bar
                    key={cat.id}
                    dataKey={cat.name}
                    stackId="a"
                    fill={getCatColor(cat, idx)}
                    radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  />
                ))
              ) : (
                <Bar
                  dataKey={selectedCategory}
                  fill={
                    getCatColor(
                      categories.find((c) => c.name === selectedCategory) || categories[0],
                      0
                    )
                  }
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
