import { NextResponse } from "next/server";
import { fetchInspirationalQuote } from "@/lib/quote-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get("genre") || "motivational";
    const quote = await fetchInspirationalQuote(genre);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { quoteText: "The secret of getting ahead is getting started.", quoteAuthor: "Mark Twain" },
      { status: 200 }
    );
  }
}
