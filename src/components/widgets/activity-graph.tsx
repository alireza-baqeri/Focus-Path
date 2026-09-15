import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import GitHubContributionBoard from "./github-contribution-board";
import { formatLocalDate } from "@/lib/date-utils";

export default async function ActivityGraph() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <GitHubContributionBoard />;
  }

  const userId = session.user.id;

  // Query watched videos for this user
  const userCourses = await prisma.course.findMany({
    where: { userId },
    select: {
      sections: {
        select: {
          videos: {
            where: { isWatched: true, watchedAtDate: { not: null } },
            select: { watchedAtDate: true, duration: true },
          },
        },
      },
    },
  });

  // Query day records with activity logs
  const dayRecords = await prisma.dayRecord.findMany({
    where: { userId },
    include: {
      activityLogs: {
        include: {
          category: true,
        },
      },
    },
  });

  // Aggregate by date string (YYYY-MM-DD)
  const map = new Map<
    string,
    { videos: number; learningHours: number; codingHours: number; allHours: number }
  >();

  // 1. Aggregate course videos
  userCourses.forEach((course) => {
    course.sections.forEach((section) => {
      section.videos.forEach((video) => {
        if (!video.watchedAtDate) return;
        const dateStr = formatLocalDate(video.watchedAtDate);
        const existing = map.get(dateStr) || {
          videos: 0,
          learningHours: 0,
          codingHours: 0,
          allHours: 0,
        };

        const hours = video.duration / 3600;
        existing.videos += 1;
        existing.learningHours += hours;
        existing.allHours += hours;
        map.set(dateStr, existing);
      });
    });
  });

  // 2. Aggregate logged activities
  dayRecords.forEach((record) => {
    const dateStr = formatLocalDate(record.date);
    const existing = map.get(dateStr) || {
      videos: 0,
      learningHours: 0,
      codingHours: 0,
      allHours: 0,
    };

    record.activityLogs.forEach((log) => {
      const catName = log.category.name.toLowerCase().trim();
      const hours = log.durationMinutes / 60;

      // Coding / Programming detection
      const isCoding =
        catName.includes("cod") ||
        catName.includes("program") ||
        catName.includes("برنامه") ||
        catName.includes("dev") ||
        catName.includes("توسعه") ||
        catName.includes("software") ||
        catName.includes("پروژه") ||
        catName.includes("web") ||
        catName.includes("front") ||
        catName.includes("back") ||
        catName.includes("react") ||
        catName.includes("python");

      // Learning / Study detection
      const isLearning =
        catName.includes("learn") ||
        catName.includes("stud") ||
        catName.includes("یادگیری") ||
        catName.includes("دانشگاه") ||
        catName.includes("univ") ||
        catName.includes("read") ||
        catName.includes("کتاب") ||
        catName.includes("مطالعه") ||
        catName.includes("آموزش") ||
        catName.includes("دوره") ||
        catName.includes("course") ||
        catName.includes("درس");

      // Non-productive/sleep category check
      const isRest =
        catName.includes("rest") ||
        catName.includes("خواب") ||
        catName.includes("استراحت") ||
        catName.includes("sleep");

      if (isCoding) {
        existing.codingHours += hours;
      }
      if (isLearning) {
        existing.learningHours += hours;
      }
      if (!isRest) {
        existing.allHours += hours;
      }
    });

    map.set(dateStr, existing);
  });

  // Format into array with 1 decimal precision
  const formattedData = Array.from(map.entries()).map(([date, values]) => ({
    date,
    videos: values.videos,
    learningHours: parseFloat(values.learningHours.toFixed(1)),
    codingHours: parseFloat(values.codingHours.toFixed(1)),
    allHours: parseFloat(values.allHours.toFixed(1)),
  }));

  return <GitHubContributionBoard initialData={formattedData} />;
}
