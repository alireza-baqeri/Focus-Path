export interface QuoteItem {
  quoteText: string;
  quoteAuthor: string;
}

const fallbackQuotes: Record<string, QuoteItem[]> = {
  motivational: [
    { quoteText: "The only limit to our realization of tomorrow will be our doubts of today.", quoteAuthor: "Franklin D. Roosevelt" },
    { quoteText: "Do what you can, with what you have, where you are.", quoteAuthor: "Theodore Roosevelt" },
    { quoteText: "It always seems impossible until it's done.", quoteAuthor: "Nelson Mandela" },
    { quoteText: "Don't watch the clock; do what it does. Keep going.", quoteAuthor: "Sam Levenson" },
    { quoteText: "Start where you are. Use what you have. Do what you can.", quoteAuthor: "Arthur Ashe" },
    { quoteText: "Act as if what you do makes a difference. It does.", quoteAuthor: "William James" },
    { quoteText: "Keep your face always toward the sunshine—and shadows will fall behind you.", quoteAuthor: "Walt Whitman" }
  ],
  success: [
    { quoteText: "Success is not final, failure is not fatal: It is the courage to continue that counts.", quoteAuthor: "Winston Churchill" },
    { quoteText: "The secret of success is to do the common thing uncommonly well.", quoteAuthor: "John D. Rockefeller Jr." },
    { quoteText: "Success usually comes to those who are too busy to be looking for it.", quoteAuthor: "Henry David Thoreau" },
    { quoteText: "Don't be afraid to give up the good to go for the great.", quoteAuthor: "John D. Rockefeller" },
    { quoteText: "I find that the harder I work, the more luck I seem to have.", quoteAuthor: "Thomas Jefferson" }
  ],
  wisdom: [
    { quoteText: "The only true wisdom is in knowing you know nothing.", quoteAuthor: "Socrates" },
    { quoteText: "In the middle of difficulty lies opportunity.", quoteAuthor: "Albert Einstein" },
    { quoteText: "Turn your wounds into wisdom.", quoteAuthor: "Oprah Winfrey" },
    { quoteText: "Knowing yourself is the beginning of all wisdom.", quoteAuthor: "Aristotle" },
    { quoteText: "The unexamined life is not worth living.", quoteAuthor: "Socrates" }
  ],
  technology: [
    { quoteText: "Any sufficiently advanced technology is indistinguishable from magic.", quoteAuthor: "Arthur C. Clarke" },
    { quoteText: "Technology is best when it brings people together.", quoteAuthor: "Matt Mullenweg" },
    { quoteText: "It has become appallingly obvious that our technology has exceeded our humanity.", quoteAuthor: "Albert Einstein" },
    { quoteText: "The great myth of our times is that technology is communication.", quoteAuthor: "Libby Larsen" },
    { quoteText: "First, solve the problem. Then, write the code.", quoteAuthor: "John Johnson" }
  ],
  life: [
    { quoteText: "Life is what happens when you're busy making other plans.", quoteAuthor: "John Lennon" },
    { quoteText: "The purpose of our lives is to be happy.", quoteAuthor: "Dalai Lama" },
    { quoteText: "Get busy living or get busy dying.", quoteAuthor: "Stephen King" },
    { quoteText: "You only live once, but if you do it right, once is enough.", quoteAuthor: "Mae West" },
    { quoteText: "In three words I can sum up everything I've learned about life: it goes on.", quoteAuthor: "Robert Frost" }
  ]
};

export async function fetchInspirationalQuote(genre: string = "motivational"): Promise<QuoteItem> {
  const normalizedGenre = (genre || "motivational").toLowerCase();
  
  // 1. Attempt ZenQuotes
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://zenquotes.io/api/random", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.q) {
        return {
          quoteText: data[0].q,
          quoteAuthor: data[0].a || "Unknown",
        };
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Attempt DummyJSON
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://dummyjson.com/quotes/random", {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.quote) {
        return {
          quoteText: data.quote,
          quoteAuthor: data.author || "Unknown",
        };
      }
    }
  } catch {
    // Continue to curated list
  }

  // 3. Category curated selection (dynamically picks based on time/randomness)
  const categoryPool = fallbackQuotes[normalizedGenre] || fallbackQuotes.motivational;
  const randomIndex = Math.floor(Math.random() * categoryPool.length);
  return categoryPool[randomIndex];
}
