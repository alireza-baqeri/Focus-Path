import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CourseTrackerContainer from "@/components/courses/course-tracker-container";

export const metadata = {
  title: "Course Tracker | Process Tracker",
  description: "Track your video courses, sections, lectures, and automate learning hours.",
};

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <CourseTrackerContainer />
    </div>
  );
}
