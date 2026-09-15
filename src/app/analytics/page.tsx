import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BarChart2, TrendingUp, Clock, CheckCircle2, Flame, CalendarDays, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityGraph from "@/components/widgets/activity-graph";
import { calculateUserStreak } from "@/lib/streak-utils";

export const metadata = {
  title: "Deep Analytics | Process Tracker",
  description: "Comprehensive analytics and performance metrics for your habits and courses.",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Stats calculation
  const courses = await prisma.course.findMany({
    where: { userId },
    include: {
      sections: {
        include: { videos: true },
      },
    },
  });

  const totalVideos = courses.reduce(
    (acc, c) => acc + c.sections.reduce((sAcc, s) => sAcc + s.videos.length, 0),
    0
  );
  const watchedVideos = courses.reduce(
    (acc, c) =>
      acc +
      c.sections.reduce(
        (sAcc, s) => sAcc + s.videos.filter((v) => v.isWatched).length,
        0
      ),
    0
  );
  const totalDurationSeconds = courses.reduce((acc, c) => acc + c.totalDuration, 0);

  const dayRecords = await prisma.dayRecord.findMany({
    where: { userId },
    include: {
      activityLogs: { include: { category: true } },
    },
  });

  // Calculate total coding and study hours
  let totalCodingMinutes = 0;
  let totalStudyMinutes = 0;
  const activeDaysSet = new Set<string>();

  dayRecords.forEach((dr) => {
    let hasActivity = false;
    dr.activityLogs.forEach((log) => {
      hasActivity = true;
      const name = log.category.name.toLowerCase();
      if (name.includes("cod") || name.includes("برنامه") || name.includes("dev") || name.includes("توسعه")) {
        totalCodingMinutes += log.durationMinutes;
      } else {
        totalStudyMinutes += log.durationMinutes;
      }
    });
    if (hasActivity) {
      activeDaysSet.add(dr.date.toISOString().split('T')[0]);
    }
  });

  courses.forEach(c => c.sections.forEach(s => s.videos.forEach(v => {
    if (v.isWatched && v.watchedAtDate) {
      activeDaysSet.add(v.watchedAtDate.toISOString().split('T')[0]);
    }
  })));

  const totalActiveDays = activeDaysSet.size;
  const totalHoursLogged = (totalCodingMinutes + totalStudyMinutes) / 60;
  const dailyAvgHours = totalActiveDays > 0 ? (totalHoursLogged / totalActiveDays) : 0;
  
  const avgVideosPerDay = totalActiveDays > 0 ? (watchedVideos / totalActiveDays) : 0;
  const remainingVideos = totalVideos - watchedVideos;
  const estimatedDaysToFinish = avgVideosPerDay > 0 ? Math.ceil(remainingVideos / avgVideosPerDay) : 0;

  const currentStreak = await calculateUserStreak(userId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Deep Analytics
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              High-level overview of your total learning, coding hours, and completion probabilities
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
              <span>Course Progress</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {watchedVideos} of {totalVideos} lectures watched
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
              <span>Coding Logged</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalCodingMinutes / 60).toFixed(1)}h
            </div>
            <p className="text-xs text-gray-500 mt-1">Dedicated coding sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
              <span>Study Logged</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalStudyMinutes / 60).toFixed(1)}h
            </div>
            <p className="text-xs text-gray-500 mt-1">Course & university hours</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
              <span>Current Streak</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} Days</div>
            <p className="text-xs text-gray-500 mt-1">
              Keep the momentum going!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Computational / Probabilistic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400/80 font-semibold flex items-center justify-between">
              <span>Active Days</span>
              <CalendarDays className="w-4 h-4 text-indigo-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{totalActiveDays}</div>
            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">Total days with recorded activity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900 border-emerald-100 dark:border-emerald-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-emerald-500/80 dark:text-emerald-400/80 font-semibold flex items-center justify-between">
              <span>Avg Daily Activity</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{dailyAvgHours.toFixed(1)}h</div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Average hours per active day</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900 border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-amber-500/80 dark:text-amber-400/80 font-semibold flex items-center justify-between">
              <span>Est. Course Completion</span>
              <Target className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">~{estimatedDaysToFinish} Days</div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">At current rate ({avgVideosPerDay.toFixed(1)} vids/day)</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Board (Full Stacked View) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold">Activity Visualization</h3>
        <ActivityGraph />
      </div>
    </div>
  );
}
