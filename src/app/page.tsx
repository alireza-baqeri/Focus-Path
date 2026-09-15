/**
 * Module: Home Page (Dashboard)
 * Path: src/app/page.tsx
 * 
 * Description:
 * This is the primary entry point for authenticated users. It acts as the central hub
 * displaying dynamic widgets (Crypto, Weather, News, Quotes), daily progress, and
 * the activity graph (GitHub contribution style).
 * 
 * Architecture:
 * - This is a React Server Component (RSC).
 * - It directly queries the database via Prisma to fetch User data and Settings.
 * - It passes necessary data (e.g., city, country codes) to Client Components (Widgets) as props.
 */
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

// Widgets
import QuoteWidget from "@/components/widgets/quote-widget";
import WeatherWidget from "@/components/widgets/weather-widget";
import CryptoWidget from "@/components/widgets/crypto-widget";
import NewsWidget from "@/components/widgets/news-widget";
import ActivityGraph from "@/components/widgets/activity-graph";
import NavigationCards from "@/components/widgets/navigation-cards";
import GoalProgressCards from "@/components/widgets/goal-progress-cards";
import MotionWrapper from "@/components/ui/motion-wrapper";
import DayProgressWidget from "@/components/widgets/day-progress-widget";
import LandingPage from "@/components/marketing/landing-page";

export const dynamic = "force-dynamic";

export default async function Home() {
  // 1. Authenticate the user on the server side
  const session = await getServerSession(authOptions);

  // 2. Conditional Routing:
  // If the user is a guest (not logged in), serve them the public Landing Page (Marketing/Product page).
  // This avoids the need for a separate `/dashboard` route and keeps the architecture simple.
  if (!session || !session.user) {
    return <LandingPage />;
  }

  // 3. If authenticated, fetch their unique data and render the Dashboard
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });

  const settings = user?.settings;
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <MotionWrapper delay={0.1}>
        <header className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Welcome, {firstName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Here's what's happening with your progress today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <DayProgressWidget />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm shadow-black/5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>
      </MotionWrapper>

      {/* Top Widgets Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionWrapper delay={0.2} className="h-full">
          <WeatherWidget city={settings?.weatherCity || "Tehran"} />
        </MotionWrapper>
        <MotionWrapper delay={0.3} className="h-full">
          <CryptoWidget />
        </MotionWrapper>
        <MotionWrapper delay={0.4} className="h-full">
          <QuoteWidget category={settings?.quoteCategory || "inspire"} />
        </MotionWrapper>
        <MotionWrapper delay={0.5} className="h-full">
          <NewsWidget country={settings?.newsCountry || "us"} />
        </MotionWrapper>
      </section>

      {/* Daily Progress & GitHub Graph */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionWrapper delay={0.6} className="col-span-1 lg:col-span-2 space-y-6">
          <ActivityGraph />
        </MotionWrapper>
        <MotionWrapper delay={0.7} className="col-span-1 space-y-6">
          <GoalProgressCards userId={session.user.id} />
        </MotionWrapper>
      </section>

      {/* Module Navigation */}
      <MotionWrapper delay={0.8}>
        <section>
          <h2 className="text-2xl font-bold mb-4">Modules</h2>
          <NavigationCards />
        </section>
      </MotionWrapper>
    </div>
  );
}

/**
 * HOW THIS MODULE WORKS:
 * 1. Checks authentication via getServerSession (Server-side validation).
 * 2. If unauthenticated, securely redirects to /login before rendering anything.
 * 3. Fetches the user's explicit Settings from the database (weatherCity, newsCountry, etc.).
 * 4. Renders the layout using `MotionWrapper` for highly optimized, staggered Framer Motion entrance animations.
 * 5. Passes settings strings downwards to client-side widgets so they can fetch their respective external APIs 
 *    without exposing database connections to the client.
 */
