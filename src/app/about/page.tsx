import { Leaf, Target, Zap, Clock } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "About Us | Focus Path",
  description: "Learn more about the philosophy behind Focus Path.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#02020a] text-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-20">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-500 mb-6">
            Our Philosophy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Focus Path was built to bridge the gap between abstract goal setting and daily execution. We believe that grand achievements are simply the result of consistent, daily micro-habits.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-[0_0_50px_-15px_rgba(147,51,234,0.3)] mb-20 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
          <Image src="/footer-art.png" alt="Focus Path Journey" fill className="object-cover" />
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Time is your only currency</h3>
            <p className="text-gray-400 leading-relaxed">
              Every hour logged in Focus Path is an investment in your future self. By visualizing where your time goes through our Deep Analytics, you take back control of your day.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Deep Work matters</h3>
            <p className="text-gray-400 leading-relaxed">
              In a world full of distractions, the ability to focus is a superpower. Our built-in Pomodoro timers and smart timetables are specifically designed to cultivate deep, uninterrupted work sessions.
            </p>
          </div>
        </div>

        {/* Closing */}
        <div className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
          <Target className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Start building your path today</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Join the journey. Track your progress, maintain your streak, and see what you are truly capable of achieving when you focus.
          </p>
        </div>

      </div>
    </div>
  );
}
