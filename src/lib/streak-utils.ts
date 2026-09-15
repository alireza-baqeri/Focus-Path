import prisma from "@/lib/prisma";
import { formatLocalDate } from "@/lib/date-utils";

export async function calculateUserStreak(userId: string): Promise<number> {
  try {
    // Fetch day records that have at least one activity log
    const activeDayRecords = await prisma.dayRecord.findMany({
      where: {
        userId,
        activityLogs: {
          some: {}, // At least one activity log
        },
      },
      select: {
        date: true,
      },
    });

    // Fetch videos watched by the user
    const watchedVideos = await prisma.video.findMany({
      where: {
        section: {
          course: {
            userId,
          },
        },
        isWatched: true,
        watchedAtDate: {
          not: null,
        },
      },
      select: {
        watchedAtDate: true,
      },
    });

    // Extract all unique dates formatted as YYYY-MM-DD local
    const activeDateStrings = new Set<string>();
    
    activeDayRecords.forEach((record) => {
      if (record.date) {
        // Date in DB is stored at UTC midnight, which corresponds to local midnight.
        // We can just format it using our local date formatter.
        activeDateStrings.add(formatLocalDate(record.date));
      }
    });

    watchedVideos.forEach((video) => {
      if (video.watchedAtDate) {
        activeDateStrings.add(formatLocalDate(video.watchedAtDate));
      }
    });

    const sortedDates = Array.from(activeDateStrings).sort((a, b) => (a < b ? 1 : -1)); // Descending

    if (sortedDates.length === 0) return 0;

    // Calculate streak from today or yesterday
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatLocalDate(today);
    const yesterdayStr = formatLocalDate(yesterday);

    let streak = 0;
    const currentDateStr = sortedDates.includes(todayStr) ? todayStr : (sortedDates.includes(yesterdayStr) ? yesterdayStr : null);

    if (!currentDateStr) {
      return 0; // No activity today or yesterday, streak broken
    }

    // Now count backward from currentDateStr
    let currentCheckDate = new Date(currentDateStr); // This will parse YYYY-MM-DD locally if we provide it carefully, but it's safer to build
    // Actually, new Date("YYYY-MM-DD") creates UTC midnight, let's just do manual string manipulation or date object math.
    const [y, m, d] = currentDateStr.split("-").map(Number);
    currentCheckDate = new Date(y, m - 1, d, 12, 0, 0); // Noon local time to avoid timezone edge cases

    let dateIndex = sortedDates.indexOf(currentDateStr);

    while (dateIndex !== -1 && dateIndex < sortedDates.length) {
      const expectedStr = formatLocalDate(currentCheckDate);
      
      if (sortedDates.includes(expectedStr)) {
        streak++;
        // Move back one day
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        dateIndex = sortedDates.indexOf(expectedStr); // just to continue the loop logically
      } else {
        break; // Streak broken
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
}
