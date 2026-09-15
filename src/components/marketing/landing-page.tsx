"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, BarChart2, Clock, Sparkles } from "lucide-react";

/**
 * LandingPage Component
 * 
 * This is the public-facing homepage for Focus Path.
 * It uses framer-motion for smooth entrance animations and showcases
 * a premium, glassmorphism-inspired aesthetic with deep purple and gold accents.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#02020a] overflow-hidden selection:bg-purple-500/30 font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-gray-300">Your Ultimate Productivity Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight leading-tight mb-6"
          >
            Focus on today. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-300 to-purple-500">
              Build a better tomorrow.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
          >
            Plan your day. Build good habits. Stay consistent. 
            Focus Path combines time-tracking, Pomodoro sessions, and deep analytics to help you reach your goals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative">Start Your Journey</span>
              <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/guide"
              className="px-8 py-4 font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md"
            >
              How it works
            </Link>
          </motion.div>
        </div>

        {/* Hero Image / Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex-1 relative w-full max-w-2xl lg:max-w-none"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/40 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <img
              src="/landing.png"
              alt="Focus Path Dashboard Visual"
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section className="border-t border-white/5 bg-white/[0.02] backdrop-blur-3xl py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need to stay on track</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Designed for students, developers, and professionals who demand the best from their time.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-amber-400" />}
              title="Smart Timetable"
              description="Log your daily activities, sleep schedule, and journal entries all in one unified daily timeline."
            />
            <FeatureCard
              icon={<BarChart2 className="w-8 h-8 text-purple-400" />}
              title="Deep Analytics"
              description="Visualize your habits with 365-day contribution boards, velocity calculations, and predictive completion tracking."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-blue-400" />}
              title="Goal & Course Tracking"
              description="Import courses, track video completions, and manage long-term goals with our intuitive progress systems."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-300 group shadow-lg">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
