import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET: Fetch records, categories, goals, and journal entries for a range
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch user categories (or seed defaults if none exist)
    let categories = await prisma.activityCategory.findMany({
      where: { userId },
    });

    if (categories.length === 0) {
      // Seed initial default categories
      const defaults = [
        { name: "Programming", emoji: "💻", colorCode: "#3b82f6" },
        { name: "University", emoji: "🎓", colorCode: "#8b5cf6" },
        { name: "Sports", emoji: "🏋️", colorCode: "#10b981" },
        { name: "Reading", emoji: "📚", colorCode: "#f59e0b" },
        { name: "Rest", emoji: "😴", colorCode: "#6b7280" },
      ];

      for (const cat of defaults) {
        await prisma.activityCategory.create({
          data: { ...cat, userId },
        });
      }

      categories = await prisma.activityCategory.findMany({ where: { userId } });
    }

    // Fetch goals
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch day records
    const whereClause: any = { userId };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const dayRecords = await prisma.dayRecord.findMany({
      where: whereClause,
      include: {
        journalEntries: { orderBy: { orderIndex: "asc" } },
        activityLogs: { include: { category: true } },
        goalProgresses: { include: { goal: true } },
      },
    });

    // User settings (for quote, etc.)
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      categories,
      goals,
      dayRecords,
      settings,
    });
  } catch (error) {
    console.error("Timetable GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST: Save or update day record (journal, wake/sleep time, activities, goal progress)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { date, wakeTime, sleepTime, journalEntries, activityLogs, goalProgresses } = body;

    if (!date) {
      return NextResponse.json({ message: "Date is required" }, { status: 400 });
    }

    // Normalize date cleanly to UTC midnight
    const cleanDateStr = String(date).includes("T") ? String(date).split("T")[0] : String(date);
    const [y, m, d] = cleanDateStr.split("-").map(Number);
    const recordDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

    // Upsert day record
    const dayRecord = await prisma.dayRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: recordDate,
        },
      },
      update: {
        wakeTime,
        sleepTime,
      },
      create: {
        userId,
        date: recordDate,
        wakeTime,
        sleepTime,
      },
    });

    // Replace journal entries
    if (Array.isArray(journalEntries)) {
      await prisma.journalEntry.deleteMany({
        where: { dayRecordId: dayRecord.id },
      });

      for (let i = 0; i < journalEntries.length; i++) {
        const entry = journalEntries[i];
        if (entry.content?.trim()) {
          await prisma.journalEntry.create({
            data: {
              dayRecordId: dayRecord.id,
              content: entry.content.trim(),
              orderIndex: i,
            },
          });
        }
      }
    }

    // Replace activity logs
    if (Array.isArray(activityLogs)) {
      await prisma.activityLog.deleteMany({
        where: { dayRecordId: dayRecord.id },
      });

      for (const log of activityLogs) {
        if (log.categoryId && log.durationMinutes > 0) {
          await prisma.activityLog.create({
            data: {
              dayRecordId: dayRecord.id,
              categoryId: log.categoryId,
              durationMinutes: parseInt(log.durationMinutes, 10),
            },
          });
        }
      }
    }

    // Replace goal progress
    if (Array.isArray(goalProgresses)) {
      await prisma.dayGoalProgress.deleteMany({
        where: { dayRecordId: dayRecord.id },
      });

      for (const gp of goalProgresses) {
        if (gp.goalId && gp.description?.trim()) {
          await prisma.dayGoalProgress.create({
            data: {
              dayRecordId: dayRecord.id,
              goalId: gp.goalId,
              description: gp.description.trim(),
            },
          });
        }
      }
    }

    // Revalidate cached paths so dashboard widgets update immediately
    revalidatePath("/");
    revalidatePath("/timetable");

    // Return the updated full record
    const updatedRecord = await prisma.dayRecord.findUnique({
      where: { id: dayRecord.id },
      include: {
        journalEntries: { orderBy: { orderIndex: "asc" } },
        activityLogs: { include: { category: true } },
        goalProgresses: { include: { goal: true } },
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Timetable POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
