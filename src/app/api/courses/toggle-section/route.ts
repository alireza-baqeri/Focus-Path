import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sectionId } = await req.json();

    if (!sectionId) {
      return NextResponse.json({ message: "Section ID is required" }, { status: 400 });
    }

    // 1. Get all videos in section
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { videos: true },
    });

    if (!section) return NextResponse.json({ message: "Section not found" }, { status: 404 });

    const unassignedVideos = section.videos.filter(v => !v.isWatched);
    const totalDurationToAdd = unassignedVideos.reduce((acc, v) => acc + v.duration, 0);

    // 2. Mark all videos as watched
    await prisma.video.updateMany({
      where: { sectionId },
      data: { isWatched: true, watchedAtDate: new Date() },
    });

    // 3. Add ActivityLog if there are new durations
    if (totalDurationToAdd > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Upsert day record
      const dayRecord = await prisma.dayRecord.upsert({
        where: { userId_date: { userId: session.user.id, date: today } },
        create: { userId: session.user.id, date: today },
        update: {},
      });

      // Find 'Learning' category
      let cat = await prisma.activityCategory.findFirst({
        where: { name: "Learning", userId: session.user.id },
      });
      if (!cat) {
        cat = await prisma.activityCategory.create({
          data: { name: "Learning", colorCode: "#10b981", userId: session.user.id },
        });
      }

      // Append duration
      const existingLog = await prisma.activityLog.findFirst({
        where: { dayRecordId: dayRecord.id, categoryId: cat.id },
      });

      if (existingLog) {
        await prisma.activityLog.update({
          where: { id: existingLog.id },
          data: { durationMinutes: existingLog.durationMinutes + Math.ceil(totalDurationToAdd / 60) },
        });
      } else {
        await prisma.activityLog.create({
          data: {
            dayRecordId: dayRecord.id,
            categoryId: cat.id,
            durationMinutes: Math.ceil(totalDurationToAdd / 60),
          },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/courses");

    return NextResponse.json({ message: "Section marked as watched successfully" });
  } catch (error: any) {
    console.error("Error toggling section:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
