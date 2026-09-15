import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateUserStreak } from "@/lib/streak-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ streak: 0 }, { status: 401 });
    }

    const streak = await calculateUserStreak(session.user.id);
    return NextResponse.json({ streak });
  } catch (error) {
    console.error("Streak GET error:", error);
    return NextResponse.json({ streak: 0 }, { status: 500 });
  }
}
