import Link from "next/link";
// Removed lucide-react Github import since it caused build errors
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#02020a] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Focus Path Logo" className="w-8 h-8 rounded-full" />
              <span className="font-bold text-xl tracking-tight text-white">Focus Path</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm text-center md:text-left">
              The ultimate productivity hub to plan your day, build habits, and reach your goals through deep work and analytics.
            </p>
          </div>

          <div className="flex gap-8">
            <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-amber-400 transition-colors">
              About
            </Link>
            <Link href="/guide" className="text-sm font-medium text-gray-400 hover:text-amber-400 transition-colors">
              Guide
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-amber-400 transition-colors">
              App
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} Focus Path. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-gray-500">
            <span>Built by</span>
            <a 
              href="https://github.com/alireza-baqeri" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
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
