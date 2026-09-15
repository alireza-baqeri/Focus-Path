import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TimetableContainer from "@/components/timetable/timetable-container";

export const metadata = {
  title: "Time Table & Journal | Process Tracker",
  description: "Google Calendar style time table, sleep tracking, and daily activity journaling.",
};

export default async function TimetablePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <TimetableContainer />
    </div>
  );
}
