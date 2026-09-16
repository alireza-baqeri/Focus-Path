import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#02020a] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Focus Path Logo" className="w-10 h-10 rounded-full shadow-lg shadow-purple-500/20" />
              <span className="font-bold text-2xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Focus Path
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">
              The ultimate productivity and time management platform. Designed to help professionals and students plan their day, build lasting habits, and visualize long-term progress through deep analytics.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold mb-2">Product</h3>
            <Link href="/" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Features</Link>
            <Link href="/analytics" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Deep Analytics</Link>
            <Link href="/timetable" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Smart Timetable</Link>
            <Link href="/courses" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Course Tracker</Link>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold mb-2">Resources</h3>
            <Link href="/guide" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">User Guide</Link>
            <Link href="/about" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">About Us</Link>
            <Link href="/guide#pomodoro" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Pomodoro Technique</Link>
            <a href="https://github.com/alireza-baqeri" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">Developer Blog</a>
          </div>

          {/* Column 4: Legal & Social */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-semibold mb-2">Legal</h3>
            <span className="text-sm text-gray-400 cursor-not-allowed hover:text-white transition-colors">Privacy Policy</span>
            <span className="text-sm text-gray-400 cursor-not-allowed hover:text-white transition-colors">Terms of Service</span>
            <span className="text-sm text-gray-400 cursor-not-allowed hover:text-white transition-colors">Cookie Policy</span>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Focus Path. All rights reserved. Built with Next.js & Tailwind.
          </p>
          <div className="flex items-center gap-4 text-gray-500">
            <span>Designed & Developed by</span>
            <a 
              href="https://github.com/alireza-baqeri" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              <span className="font-medium text-sm">alireza-baqeri</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
