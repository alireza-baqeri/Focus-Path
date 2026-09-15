import { Card, CardContent } from "@/components/ui/card";
import { Calendar, BookOpen, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function NavigationCards() {
  const cards = [
    {
      title: "Time Table & Journal",
      description: "Plan your days and journal your activities.",
      icon: <Calendar className="h-8 w-8 text-blue-500 mb-4" />,
      href: "/timetable",
      color: "hover:border-blue-500",
    },
    {
      title: "Course Tracker",
      description: "Manage and track your video courses.",
      icon: <BookOpen className="h-8 w-8 text-emerald-500 mb-4" />,
      href: "/courses",
      color: "hover:border-emerald-500",
    },
    {
      title: "Deep Analytics",
      description: "Dive deep into your performance charts.",
      icon: <BarChart2 className="h-8 w-8 text-purple-500 mb-4" />,
      href: "/analytics",
      color: "hover:border-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Link href={card.href} key={index}>
          <Card className={`bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-800 transition-all cursor-pointer h-full ${card.color} hover:shadow-md group`}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="transform group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{card.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{card.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
