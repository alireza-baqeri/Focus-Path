"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote, RefreshCw } from "lucide-react";

interface QuoteWidgetProps {
  category: string;
}

export default function QuoteWidget({ category }: QuoteWidgetProps) {
  const [quote, setQuote] = useState<{ quoteText: string; quoteAuthor: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async (cat: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quote?genre=${encodeURIComponent(cat || "motivational")}`);
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch {
      setQuote({
        quoteText: "It always seems impossible until it's done.",
        quoteAuthor: "Nelson Mandela",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote(category);
  }, [category]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-gray-900 dark:to-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span className="capitalize">{category || "Daily"} Quote</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchQuote(category)}
              disabled={loading}
              title="Get a new quote"
              className="p-1 rounded-md text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Quote className="h-4 w-4 text-purple-500" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quote ? (
          <div className="flex flex-col h-full justify-between space-y-2">
            <p className="text-sm italic text-gray-800 dark:text-gray-200 line-clamp-3">
              "{quote.quoteText}"
            </p>
            <p className="text-xs text-right font-medium text-gray-500">
              — {quote.quoteAuthor}
            </p>
          </div>
        ) : (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-purple-200 dark:bg-purple-900/40 rounded w-5/6"></div>
            <div className="h-3 bg-purple-200 dark:bg-purple-900/40 rounded w-1/2"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
