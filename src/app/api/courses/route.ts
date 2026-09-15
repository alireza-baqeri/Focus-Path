import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET: Fetch all courses with sections and videos
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const courses = await prisma.course.findMany({
      where: { userId },
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
          include: {
            videos: {
              orderBy: { title: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Course GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST: Create or update a course from sync payload
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { title, rootPath, sections } = body;

    if (!title || !Array.isArray(sections)) {
      return NextResponse.json({ message: "Title and sections array are required" }, { status: 400 });
    }

    // Calculate total duration
    let totalDuration = 0;
    sections.forEach((sec: any) => {
      if (Array.isArray(sec.videos)) {
        sec.videos.forEach((v: any) => {
          totalDuration += v.duration || 0;
        });
      }
    });

    // Check if course with same rootPath or title exists for user
    const existing = await prisma.course.findFirst({
      where: {
        userId,
        OR: [{ rootPath: rootPath || title }, { title }],
      },
    });

    let courseId = existing?.id;

    if (existing) {
      await prisma.course.update({
        where: { id: existing.id },
        data: {
          title,
          totalDuration,
        },
      });
    } else {
      const created = await prisma.course.create({
        data: {
          userId,
          title,
          rootPath: rootPath || title,
          totalDuration,
        },
      });
      courseId = created.id;
    }

    // Create sections & videos
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const secData = sections[sIdx];
      let section = await prisma.section.findFirst({
        where: { courseId, title: secData.title },
      });

      if (!section) {
        section = await prisma.section.create({
          data: {
            courseId: courseId!,
            title: secData.title,
            orderIndex: sIdx,
          },
        });
      }

      if (Array.isArray(secData.videos)) {
        for (const vid of secData.videos) {
          const existingVid = await prisma.video.findFirst({
            where: { sectionId: section.id, title: vid.title },
          });

          if (!existingVid) {
            await prisma.video.create({
              data: {
                sectionId: section.id,
                title: vid.title,
                duration: vid.duration || 0,
                isWatched: false,
              },
            });
          }
        }
      }
    }

    const fullCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { orderIndex: "asc" },
          include: { videos: true },
        },
      },
    });

    return NextResponse.json(fullCourse, { status: 201 });
  } catch (error) {
    console.error("Course sync POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
