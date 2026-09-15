import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { videoId, isFlagged, notes } = await req.json();

    if (!videoId) {
      return NextResponse.json({ message: "Video ID is required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (isFlagged !== undefined) dataToUpdate.isFlagged = isFlagged;
    if (notes !== undefined) dataToUpdate.notes = notes;

    await prisma.video.update({
      where: { id: videoId },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: "Metadata updated successfully" });
  } catch (error: any) {
    console.error("Error updating video meta:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
