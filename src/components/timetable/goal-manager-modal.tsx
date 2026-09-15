"use client";

import { useState } from "react";
import { X, Target, Plus, Trash2, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Goal {
  id: string;
  title: string;
  targetDescription?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ActivityCategory {
  id: string;
  name: string;
  emoji: string;
  colorCode: string;
}

interface GoalManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  categories: ActivityCategory[];
  onAddGoal: (goal: any) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onAddCategory: (cat: any) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export default function GoalManagerModal({
  isOpen,
  onClose,
  goals,
  categories,
  onAddGoal,
  onDeleteGoal,
  onAddCategory,
  onDeleteCategory,
}: GoalManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"goals" | "categories">("goals");

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [goalError, setGoalError] = useState("");
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("⚡");
  const [catColor, setCatColor] = useState("#3b82f6");
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  if (!isOpen) return null;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalError("");

    if (!goalTitle.trim()) {
      setGoalError("Goal title is required");
      return;
    }

    if (goals.length >= 3) {
      setGoalError("You can have a maximum of 3 active goals.");
      return;
    }

    setIsSubmittingGoal(true);
    try {
      await onAddGoal({
        title: goalTitle.trim(),
        targetDescription: goalDesc.trim(),
        startDate,
        endDate,
      });
      setGoalTitle("");
      setGoalDesc("");
    } catch (err: any) {
      setGoalError(err.message || "Failed to create goal");
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSubmittingCat(true);
    try {
      await onAddCategory({
        name: catName.trim(),
        emoji: catEmoji.trim() || "📌",
        colorCode: catColor,
      });
      setCatName("");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Manage Targets & Categories
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === "goals"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Active Goals ({goals.length}/3)
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === "categories"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Activity Categories ({categories.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {activeTab === "goals" ? (
            <div className="space-y-6">
              {/* Goal List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Current Targets (Max 3)
                </span>
                {goals.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No goals defined yet.</p>
                ) : (
                  goals.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          {g.title}
                        </div>
                        {g.targetDescription && (
                          <div className="text-[11px] text-gray-500 line-clamp-1">
                            {g.targetDescription}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(g.startDate).toLocaleDateString()} —{" "}
                            {new Date(g.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Goal Form */}
              {goals.length < 3 && (
                <form onSubmit={handleCreateGoal} className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Add Target
                  </span>
                  {goalError && (
                    <p className="text-xs text-red-500 font-medium">{goalError}</p>
                  )}
                  <div>
                    <input
                      type="text"
                      placeholder="Goal Title (e.g. Master React & Next.js)"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Target description or measurable milestone"
                      value={goalDesc}
                      onChange={(e) => setGoalDesc(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                      />
                    </div>
                  </div>
                  <Button type="submit" size="sm" className="w-full" disabled={isSubmittingGoal}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {isSubmittingGoal ? "Creating..." : "Save Goal"}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            /* Categories Tab */
            <div className="space-y-6">
              {/* Category List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Existing Categories
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-xs"
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>{c.emoji}</span>
                        <span>{c.name}</span>
                      </div>
                      <button
                        onClick={() => onDeleteCategory(c.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleCreateCategory} className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Add Category
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1">
                    <label className="text-[10px] text-gray-400 block mb-1">Emoji</label>
                    <input
                      type="text"
                      value={catEmoji}
                      onChange={(e) => setCatEmoji(e.target.value)}
                      className="w-full text-center text-sm px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-gray-400 block mb-1">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meditation, Writing"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 outline-none"
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full" disabled={isSubmittingCat}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {isSubmittingCat ? "Adding..." : "Add Category"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
