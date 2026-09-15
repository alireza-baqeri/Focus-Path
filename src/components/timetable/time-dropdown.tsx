"use client";

import { useState, useEffect } from "react";

interface TimeDropdownProps {
  label: string;
  value: string; // e.g. "07:30 AM"
  onChange: (val: string) => void;
}

export default function TimeDropdown({ label, value, onChange }: TimeDropdownProps) {
  const parseTime = (str: string) => {
    if (!str) return { hour: "07", minute: "00", period: "AM" };
    const parts = str.split(" ");
    const period = parts[1] || "AM";
    const timeParts = (parts[0] || "07:00").split(":");
    return {
      hour: timeParts[0] || "07",
      minute: timeParts[1] || "00",
      period,
    };
  };

  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  useEffect(() => {
    const p = parseTime(value);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  const update = (h: string, m: string, p: string) => {
    setHour(h);
    setMinute(m);
    setPeriod(p);
    onChange(`${h}:${m} ${p}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 gap-2">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-1.5">
        {/* Hour */}
        <select
          value={hour}
          onChange={(e) => update(e.target.value, minute, period)}
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs rounded-md px-2 py-1 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-gray-400 font-bold">:</span>
        {/* Minute */}
        <select
          value={minute}
          onChange={(e) => update(hour, e.target.value, period)}
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs rounded-md px-2 py-1 font-medium focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {/* AM/PM */}
        <select
          value={period}
          onChange={(e) => update(hour, minute, e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-xs rounded-md px-2 py-1 font-semibold text-blue-600 dark:text-blue-400 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
