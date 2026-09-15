"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, CheckCircle2, Quote, Sparkles, Target, Activity } from "lucide-react";
import TimeDropdown from "./time-dropdown";
import { Button } from "@/components/ui/button";

interface ActivityCategory {
  id: string;
  name: string;
  emoji: string;
  colorCode: string;
}

interface Goal {
  id: string;
  title: string;
  targetDescription?: string | null;
}

interface DailyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // YYYY-MM-DD
  dayRecord?: any;
  categories: ActivityCategory[];
  goals: Goal[];
  onSave: (data: any) => Promise<void>;
  quoteCategory?: string;
}

export default function DailyJournalModal({
  isOpen,
  onClose,
  dateStr,
  dayRecord,
  categories,
  goals,
  onSave,
  quoteCategory = "inspire",
}: DailyJournalModalProps) {
  const [wakeTime, setWakeTime] = useState("07:00 AM");
  const [sleepTime, setSleepTime] = useState("11:30 PM");
  const [journalItems, setJournalItems] = useState<string[]>([""]);
  const [activities, setActivities] = useState<{ categoryId: string; durationMinutes: number }[]>([]);
  const [goalInputs, setGoalInputs] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  // Initialize state when dayRecord changes
  useEffect(() => {
    if (dayRecord) {
      setWakeTime(dayRecord.wakeTime || "07:00 AM");
      setSleepTime(dayRecord.sleepTime || "11:30 PM");

      if (dayRecord.journalEntries && dayRecord.journalEntries.length > 0) {
        setJournalItems(dayRecord.journalEntries.map((e: any) => e.content));
      } else {
        setJournalItems([""]);
      }

      if (dayRecord.activityLogs && dayRecord.activityLogs.length > 0) {
        setActivities(
          dayRecord.activityLogs.map((l: any) => ({
            categoryId: l.categoryId,
            durationMinutes: l.durationMinutes,
          }))
        );
      } else {
        setActivities([]);
      }

      if (dayRecord.goalProgresses) {
        const map: Record<string, string> = {};
        dayRecord.goalProgresses.forEach((gp: any) => {
          map[gp.goalId] = gp.description;
        });
        setGoalInputs(map);
      } else {
        setGoalInputs({});
      }
    } else {
      setWakeTime("07:00 AM");
      setSleepTime("11:30 PM");
      setJournalItems([""]);
      setActivities([]);
      setGoalInputs({});
    }
  }, [dayRecord, dateStr]);

  // Fetch inspirational quote
  useEffect(() => {
    async function loadQuote() {
      try {
        const res = await fetch(
          `/api/quote?genre=${encodeURIComponent(quoteCategory || "motivational")}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.quoteText) {
            setQuote({
              text: data.quoteText,
              author: data.quoteAuthor,
            });
            return;
          }
        }
      } catch (e) {}

      // Fallback
      setQuote({
        text: "Small daily improvements over time lead to stunning results.",
        author: "Robin Sharma",
      });
    }

    if (isOpen) {
      loadQuote();
    }
  }, [isOpen, quoteCategory]);

  if (!isOpen) return null;

  // Form handlers
  const handleAddJournalItem = () => {
    setJournalItems([...journalItems, ""]);
  };

  const handleUpdateJournalItem = (index: number, val: string) => {
    const updated = [...journalItems];
    updated[index] = val;
    setJournalItems(updated);
  };

  const handleRemoveJournalItem = (index: number) => {
    if (journalItems.length <= 1) {
      setJournalItems([""]);
    } else {
      setJournalItems(journalItems.filter((_, i) => i !== index));
    }
  };

  const handleAddActivity = (catId: string) => {
    if (activities.some((a) => a.categoryId === catId)) return;
    setActivities([...activities, { categoryId: catId, durationMinutes: 60 }]);
  };

  const handleUpdateActivityDuration = (catId: string, minutes: number) => {
    setActivities(
      activities.map((a) => (a.categoryId === catId ? { ...a, durationMinutes: Math.max(0, minutes) } : a))
    );
  };

  const handleRemoveActivity = (catId: string) => {
    setActivities(activities.filter((a) => a.categoryId !== catId));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    const goalProgressList = Object.entries(goalInputs)
      .filter(([_, desc]) => desc.trim().length > 0)
      .map(([goalId, description]) => ({ goalId, description }));

    const payload = {
      date: dateStr,
      wakeTime,
      sleepTime,
      journalEntries: journalItems
        .filter((item) => item.trim().length > 0)
        .map((content, idx) => ({ content, orderIndex: idx })),
      activityLogs: activities.filter((a) => a.durationMinutes > 0),
      goalProgresses: goalProgressList,
    };

    try {
      await onSave(payload);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
              Daily Planner & Journal
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Motivational Quote Banner */}
          {quote && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200/50 dark:border-purple-800/40 text-xs">
              <div className="flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="italic text-gray-700 dark:text-gray-300">"{quote.text}"</p>
                  <p className="text-right text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1">
                    — {quote.author}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 1. Wake Time Dropdown (At top as requested) */}
          <TimeDropdown
            label="🌅 Wake Up Time"
            value={wakeTime}
            onChange={(val) => setWakeTime(val)}
          />

          {/* 2. Active Goals Progress Box */}
          {goals && goals.length > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Goal Progression Today</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Write down what you did today towards your active targets:
              </p>
              <div className="space-y-2.5">
                {goals.map((g) => (
                  <div key={g.id} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {g.title}
                    </label>
                    <input
                      type="text"
                      placeholder={`What did you achieve today for "${g.title}"?`}
                      value={goalInputs[g.id] || ""}
                      onChange={(e) =>
                        setGoalInputs({ ...goalInputs, [g.id]: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Activity Category Logging */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Activities & Time Spent</span>
              </label>
            </div>

            {/* Category Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = activities.some((a) => a.categoryId === cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      isSelected ? handleRemoveActivity(cat.id) : handleAddActivity(cat.id)
                    }
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                    {isSelected ? <X className="w-3 h-3 ml-0.5" /> : <Plus className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Selected activities duration inputs */}
            {activities.length > 0 && (
              <div className="space-y-2 pt-2">
                {activities.map((act) => {
                  const cat = categories.find((c) => c.id === act.categoryId);
                  if (!cat) return null;
                  const hours = Math.floor(act.durationMinutes / 60);
                  const mins = act.durationMinutes % 60;

                  return (
                    <div
                      key={act.categoryId}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={hours}
                            onChange={(e) =>
                              handleUpdateActivityDuration(
                                act.categoryId,
                                parseInt(e.target.value || "0") * 60 + mins
                              )
                            }
                            className="w-12 text-center text-xs px-1 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold"
                          />
                          <span className="text-[11px] text-gray-400">h</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            step="5"
                            value={mins}
                            onChange={(e) =>
                              handleUpdateActivityDuration(
                                act.categoryId,
                                hours * 60 + parseInt(e.target.value || "0")
                              )
                            }
                            className="w-12 text-center text-xs px-1 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-bold"
                          />
                          <span className="text-[11px] text-gray-400">m</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(act.categoryId)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Journal / Things Done (Ordered List + Input) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                📝 Things Done & Minimalist Journal
              </label>
              <button
                type="button"
                onClick={handleAddJournalItem}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {journalItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-right text-xs font-bold text-gray-400 select-none">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Worked out, helped my wife with shopping, read 30 pages..."
                    value={item}
                    onChange={(e) => handleUpdateJournalItem(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddJournalItem();
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  />
                  {journalItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveJournalItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Sleep Time Dropdown (At bottom as requested) */}
          <TimeDropdown
            label="🌙 Sleep Time"
            value={sleepTime}
            onChange={(val) => setSleepTime(val)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="text-xs text-gray-400">
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully!
              </span>
            ) : (
              "Press save to keep your daily journal updated."
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Journal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
