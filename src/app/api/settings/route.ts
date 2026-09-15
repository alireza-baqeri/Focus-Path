import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, weatherCity, newsCountry, quoteCategory } = body;

    // Update User
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update Settings
    await prisma.settings.upsert({
      where: { userId: session.user.id },
      update: { weatherCity, newsCountry, quoteCategory },
      create: { userId: session.user.id, weatherCity, newsCountry, quoteCategory },
    });

    revalidatePath("/");

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("Settings Update Error", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
