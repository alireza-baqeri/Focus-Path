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

    const { videoId, isWatched } = await req.json();

    if (!videoId) {
      return NextResponse.json({ message: "Video ID is required" }, { status: 400 });
    }

    const updated = await prisma.video.update({
      where: { id: videoId },
      data: {
        isWatched: !!isWatched,
        watchedAtDate: isWatched ? new Date() : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/courses");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Video toggle error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
