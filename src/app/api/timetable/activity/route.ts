import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { durationMinutes, categoryName, date } = body;

    if (!durationMinutes || !categoryName || !date) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Parse date cleanly to UTC midnight
    const cleanDateStr = String(date).includes("T") ? String(date).split("T")[0] : String(date);
    const [y, m, d] = cleanDateStr.split("-").map(Number);
    const recordDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));

    // Ensure category exists
    let category = await prisma.activityCategory.findFirst({
      where: { userId, name: categoryName }
    });

    if (!category) {
      category = await prisma.activityCategory.create({
        data: {
          userId,
          name: categoryName,
          emoji: "⏳",
          colorCode: "#f43f5e", // Rose/Red for Pomodoro
        }
      });
    }

    // Upsert day record
    const dayRecord = await prisma.dayRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: recordDate,
        },
      },
      update: {}, // Just find or create
      create: {
        userId,
        date: recordDate,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        dayRecordId: dayRecord.id,
        categoryId: category.id,
        durationMinutes: durationMinutes,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity log POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
