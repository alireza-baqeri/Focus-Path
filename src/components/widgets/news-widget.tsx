import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

const API_KEY = "c0db6e48a8724d4294e88d792f2f2b48";

interface Article {
  title: string;
  url: string;
  source?: { name: string };
}

const fallbackArticles: Article[] = [
  {
    title: "Next.js 15 Released with Faster Turbopack and React 19 Support",
    url: "https://nextjs.org/blog",
    source: { name: "Next.js Blog" },
  },
  {
    title: "TypeScript 5.6 brings new language features and compiler optimizations",
    url: "https://devblogs.microsoft.com/typescript/",
    source: { name: "Microsoft DevBlogs" },
  },
  {
    title: "Web Standards: ECMAScript 2024 specifications officially approved",
    url: "https://tc39.es/",
    source: { name: "TC39" },
  },
  {
    title: "AI in Software Engineering: How Agentic Workflows are Changing Pair Programming",
    url: "https://news.ycombinator.com",
    source: { name: "Tech News" },
  },
  {
    title: "Global tech markets see strong growth in renewable energy & semiconductors",
    url: "https://www.reuters.com/technology",
    source: { name: "Reuters" },
  },
];

async function getNews(countryCode: string): Promise<Article[]> {
  const code = (countryCode || "us").toLowerCase().trim();

  // NewsAPI does not support 'ir' in top-headlines, so use 'everything?q=Iran'
  const isIran = code === "ir" || code === "iran";
  const primaryUrl = isIran
    ? `https://newsapi.org/v2/everything?q=Iran&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`
    : `https://newsapi.org/v2/top-headlines?country=${code}&pageSize=20&apiKey=${API_KEY}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(primaryUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const articles = (data.articles || []).filter(
        (a: any) => a.title && a.title !== "[Removed]" && a.url
      );
      if (articles.length > 0) {
        return articles;
      }
    }

    // Secondary fallback for countries with 0 top headlines
    if (!isIran) {
      const fallbackUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${API_KEY}`;
      const resFallback = await fetch(fallbackUrl, { next: { revalidate: 3600 } });
      if (resFallback.ok) {
        const data = await resFallback.json();
        const articles = (data.articles || []).filter(
          (a: any) => a.title && a.title !== "[Removed]" && a.url
        );
        if (articles.length > 0) {
          return articles;
        }
      }
    }
  } catch (error) {
    console.warn("News API fetch failed, using fallback articles:", error);
  }

  return fallbackArticles;
}

export default async function NewsWidget({ country }: { country: string }) {
  const articles = await getNews(country);

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span className="uppercase tracking-wider">
            {country ? `${country.toUpperCase()} News` : "Global Headlines"}
          </span>
          <Newspaper className="h-4 w-4 text-orange-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center overflow-hidden relative p-0 pb-4 px-6">
        {articles.length > 0 ? (
          <div className="w-full overflow-hidden whitespace-nowrap group">
            <div className="inline-block animate-[marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]">
              {articles.map((article: Article, index: number) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-4 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  <span className="text-orange-500 font-bold mr-1.5">•</span>
                  {article.title}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading latest news...</p>
        )}
      </CardContent>
    </Card>
  );
}
