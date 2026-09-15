/**
 * Module: Course Progress Tracker Container
 * Path: src/components/courses/course-tracker-container.tsx
 * 
 * Description:
 * This component manages the complete UI and state for the Course Tracking feature.
 * It handles displaying courses, sections, and videos, allowing the user to mark items
 * as watched, flag videos, and write notes. It also contains the Drag and Drop logic 
 * for importing JSON course payloads.
 */
"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Video,
  ChevronDown,
  ChevronRight,
  Upload,
  ArrowLeft,
  Sparkles,
  PlayCircle,
  FolderCheck,
  Flag,
  MessageSquare,
  Target
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoItem {
  id: string;
  title: string;
  duration: number;
  isWatched: boolean;
  watchedAtDate?: string | null;
  isFlagged?: boolean;
  notes?: string | null;
}

interface SectionItem {
  id: string;
  title: string;
  orderIndex: number;
  videos: VideoItem[];
}

interface CourseItem {
  id: string;
  title: string;
  rootPath: string;
  totalDuration: number;
  sections: SectionItem[];
}

export default function CourseTrackerContainer() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [estType, setEstType] = useState<"videos" | "hours">("videos");
  const [estValue, setEstValue] = useState(5);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data[0].id);
          // Expand first 2 sections by default
          const initialExpanded: Record<string, boolean> = {};
          data[0].sections.slice(0, 3).forEach((s: SectionItem) => {
            initialExpanded[s.id] = true;
          });
          setExpandedSections(initialExpanded);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Helper duration formatter
  const formatSeconds = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m ${s}s`;
  };

  const formatVideoTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Toggle Section Accordion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle Video Watched status
  const handleToggleVideo = async (videoId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic UI update
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        sections: c.sections.map((s) => ({
          ...s,
          videos: s.videos.map((v) =>
            v.id === videoId ? { ...v, isWatched: nextStatus, watchedAtDate: nextStatus ? new Date().toISOString() : null } : v
          ),
        })),
      }))
    );

    try {
      await fetch("/api/courses/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, isWatched: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle video", err);
      fetchCourses();
    }
  };

  const handleMarkSectionWatched = async (sectionId: string) => {
    // Optimistic UI update
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        sections: c.sections.map((s) => 
          s.id === sectionId 
            ? { ...s, videos: s.videos.map(v => ({ ...v, isWatched: true, watchedAtDate: new Date().toISOString() })) } 
            : s
        ),
      }))
    );

    try {
      await fetch("/api/courses/toggle-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId }),
      });
    } catch (err) {
      fetchCourses();
    }
  };

  const handleUpdateVideoMeta = async (videoId: string, meta: { isFlagged?: boolean; notes?: string }) => {
    // Optimistic UI
    setCourses((prev) =>
      prev.map((c) => ({
        ...c,
        sections: c.sections.map((s) => ({
          ...s,
          videos: s.videos.map((v) =>
            v.id === videoId ? { ...v, ...meta } : v
          ),
        })),
      }))
    );

    try {
      await fetch("/api/courses/video-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, ...meta }),
      });
    } catch (err) {
      fetchCourses();
    }
  };

  // Import JSON handler
  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError("");
    setIsImporting(true);

    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (res.ok) {
        setIsImportModalOpen(false);
        setImportJson("");
        fetchCourses();
      } else {
        const data = await res.json();
        setImportError(data.message || "Failed to import course");
      }
    } catch (err: any) {
      setImportError("Invalid JSON format. Please paste the JSON generated by sync_course.py.");
    } finally {
      setIsImporting(false);
    }
  };

  // Calculations for active course
  const totalVideos = activeCourse
    ? activeCourse.sections.reduce((acc, s) => acc + s.videos.length, 0)
    : 0;

  const watchedVideos = activeCourse
    ? activeCourse.sections.reduce(
        (acc, s) => acc + s.videos.filter((v) => v.isWatched).length,
        0
      )
    : 0;

  const watchedSeconds = activeCourse
    ? activeCourse.sections.reduce(
        (acc, s) =>
          acc +
          s.videos
            .filter((v) => v.isWatched)
            .reduce((vAcc, v) => vAcc + v.duration, 0),
        0
      )
    : 0;

  const progressPercent = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Course Progress Tracker
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track course chapters, video lectures, and automatically feed learning hours to your dashboard
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsImportModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-9 rounded-xl"
        >
          <Upload className="w-4 h-4" />
          <span>Sync / Import Course</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          Loading course library...
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-900 border-dashed border-2 border-gray-300 dark:border-gray-700">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">No Courses Synced Yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Use our companion scanner script to scan any folder of Udemy or video courses on your machine,
              and sync them with one command!
            </p>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 font-mono text-xs text-left text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              python sync_course.py "D:\Courses\YourCourseFolder"
            </div>
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Import Course JSON</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Courses List */}
          <div className="col-span-1 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
              Your Courses ({courses.length})
            </span>
            <div className="space-y-2">
              {courses.map((course) => {
                const isSelected = course.id === selectedCourseId;
                const cTotalVids = course.sections.reduce((a, s) => a + s.videos.length, 0);
                const cWatchedVids = course.sections.reduce(
                  (a, s) => a + s.videos.filter((v) => v.isWatched).length,
                  0
                );
                const cPercent = cTotalVids > 0 ? Math.round((cWatchedVids / cTotalVids) * 100) : 0;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      // Expand first few sections
                      const initialExpanded: Record<string, boolean> = {};
                      course.sections.slice(0, 3).forEach((s) => {
                        initialExpanded[s.id] = true;
                      });
                      setExpandedSections(initialExpanded);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-white dark:bg-gray-900 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20"
                        : "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-xs font-bold line-clamp-2 ${
                          isSelected
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {course.title}
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">
                        {cPercent}%
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${cPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>
                          {cWatchedVids}/{cTotalVids} vids
                        </span>
                        <span>{formatSeconds(course.totalDuration)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Course Sections & Videos */}
          <div className="col-span-1 lg:col-span-3 space-y-5">
            {/* Overview Banner Card */}
            <Card className="p-5 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-gray-900 dark:to-teal-950/10 border-emerald-200/50 dark:border-emerald-800/40 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                    Active Course
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-0.5">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono line-clamp-1">
                    {activeCourse.rootPath}
                  </p>
                </div>

                {/* Quick Stats Pill */}
                <div className="flex items-center gap-3 bg-white dark:bg-gray-900/80 p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="text-center px-2 border-r border-gray-100 dark:border-gray-800">
                    <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {progressPercent}%
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      Completed
                    </div>
                  </div>
                  <div className="text-center px-2 border-r border-gray-100 dark:border-gray-800">
                    <div className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      {watchedVideos}/{totalVideos}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      Videos
                    </div>
                  </div>
                  <div className="text-center px-2 border-r border-gray-100 dark:border-gray-800">
                    <div className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                      {formatSeconds(watchedSeconds)}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      Watched Time
                    </div>
                  </div>
                  <div className="text-center px-2 border-r border-gray-100 dark:border-gray-800">
                    <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                      {totalVideos - watchedVideos}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      Rem. Vids
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                      {formatSeconds(activeCourse.totalDuration - watchedSeconds)}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">
                      Rem. Time
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Progress Bar */}
              <div className="mt-4 mb-4">
                <div className="w-full bg-gray-200/70 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Completion Estimator */}
              {totalVideos - watchedVideos > 0 && (
                <div className="mt-2 pt-4 border-t border-emerald-100 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span>If I do</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1"
                      value={estValue} 
                      onChange={e => setEstValue(Number(e.target.value) || 1)}
                      className="w-14 px-2 py-1 text-xs text-center font-bold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:border-emerald-500"
                    />
                    <select
                      value={estType}
                      onChange={e => setEstType(e.target.value as "videos" | "hours")}
                      className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:border-emerald-500"
                    >
                      <option value="videos">videos / day</option>
                      <option value="hours">hours / day</option>
                    </select>
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:ml-auto bg-white/50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg">
                    Course finishes in: {" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                      {estType === "videos" 
                        ? Math.ceil((totalVideos - watchedVideos) / estValue)
                        : Math.ceil((activeCourse.totalDuration - watchedSeconds) / 3600 / estValue)
                      } days
                    </strong>
                  </div>
                </div>
              )}
            </Card>

            {/* Sections Accordion */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                Course Syllabus & Lectures ({activeCourse.sections.length} Sections)
              </span>

              {activeCourse.sections.map((sec) => {
                const isExpanded = !!expandedSections[sec.id];
                const secWatched = sec.videos.filter((v) => v.isWatched).length;
                const secTotal = sec.videos.length;
                const isComplete = secTotal > 0 && secWatched === secTotal;

                return (
                  <div
                    key={sec.id}
                    className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSection(sec.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {sec.title}
                        </span>
                        {isComplete && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Finished
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-gray-400">
                        <span>
                          {secWatched}/{secTotal}
                        </span>
                        {!isComplete && secTotal > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkSectionWatched(sec.id);
                            }}
                            className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-800/40 transition-colors border border-emerald-200 dark:border-emerald-800/50"
                          >
                            Mark All Watched
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section Video Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/40 dark:bg-gray-950/20">
                        {sec.videos.map((vid, vIdx) => (
                          <div key={vid.id} className="flex flex-col">
                            <div
                              onClick={() => handleToggleVideo(vid.id, vid.isWatched)}
                              className={`p-3 pl-8 flex items-center justify-between cursor-pointer transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 ${
                                vid.isWatched ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {vid.isWatched ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 hover:text-emerald-400" />
                                )}
                                <span
                                  className={`text-xs ${
                                    vid.isWatched
                                      ? "line-through text-gray-400 dark:text-gray-500 font-medium"
                                      : "text-gray-700 dark:text-gray-200 font-medium"
                                  }`}
                                >
                                  {vid.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateVideoMeta(vid.id, { isFlagged: !vid.isFlagged });
                                  }}
                                  className={`hover:text-amber-500 transition-colors ${vid.isFlagged ? "text-amber-500" : "text-gray-300 dark:text-gray-600"}`}
                                  title="Flag for later review"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatVideoTime(vid.duration)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Notes Input Area if Flagged */}
                            {vid.isFlagged && (
                              <div className="pl-14 pr-4 pb-3 bg-amber-50/30 dark:bg-amber-950/10 border-t border-amber-100/50 dark:border-amber-900/30">
                                <div className="flex items-start gap-2 pt-2 text-amber-700 dark:text-amber-500">
                                  <MessageSquare className="w-3.5 h-3.5 mt-0.5" />
                                  <input
                                    type="text"
                                    defaultValue={vid.notes || ""}
                                    placeholder="Add a note or memo for this flagged video... (Press Enter to save)"
                                    className="text-xs bg-transparent border-none outline-none w-full placeholder:text-amber-400/70"
                                    onBlur={(e) => {
                                      if (e.target.value !== vid.notes) {
                                        handleUpdateVideoMeta(vid.id, { notes: e.target.value });
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.currentTarget.blur();
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Import / Sync JSON Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Sync / Import Video Course
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleImportJson} className="p-6 space-y-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Paste the JSON generated by <code className="text-emerald-500 font-bold">sync_course.py</code>, or run the script on your computer:
              </p>

              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 font-mono text-[11px] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                python sync_course.py "D:\Courses\YourCourseFolder"
              </div>

              {importError && (
                <p className="text-xs text-red-500 font-medium">{importError}</p>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.name.endsWith('.json')) {
                    const reader = new FileReader();
                    reader.onload = (event) => setImportJson(event.target?.result as string);
                    reader.readAsText(file);
                  } else {
                    setImportError("Please drop a valid .json file");
                  }
                }}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-4"
              >
                <div className="absolute inset-0 w-full h-full cursor-pointer z-10" onClick={() => document.getElementById("json-upload")?.click()} />
                <input 
                  id="json-upload" 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => setImportJson(event.target?.result as string);
                      reader.readAsText(file);
                    }
                  }} 
                />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 pointer-events-none">
                  Drag & Drop <span className="font-bold text-emerald-600">course_data.json</span> here
                </span>
                <span className="text-xs text-gray-400 pointer-events-none">or click to browse files</span>
              </div>
              
              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                <span className="text-[10px] uppercase font-bold text-gray-400">OR PASTE JSON</span>
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
              </div>

              <textarea
                rows={4}
                placeholder="Paste JSON content here if drag & drop is not available..."
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isImporting}
                >
                  {isImporting ? "Importing..." : "Import Course"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HOW THIS MODULE WORKS:
 * 1. Data Fetching: Calls `/api/courses` on mount to retrieve the user's parsed course tree.
 * 2. State: Maintains `selectedCourseId` for the active course and `expandedSections` for accordion toggles.
 * 3. Optimistic Updates: When a user toggles a video (`handleToggleVideo`), marks a section (`handleMarkSectionWatched`), 
 *    or updates metadata (`handleUpdateVideoMeta`), the local React state is mutated IMMEDIATELY to provide instant UX feedback.
 *    The API call is then fired in the background. If it fails, the state is re-fetched to ensure consistency.
 * 4. Course Estimator: Dynamically calculates remaining days based on `(Total - Watched) / UserInputSpeed`.
 * 5. Import Logic: Listens for Drop events or click-to-upload. It reads the `.json` file via `FileReader`, parses the text,
 *    and POSTs it to `/api/courses` which processes it server-side.
 */
