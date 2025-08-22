import { json } from "@sveltejs/kit";
import axios from "axios";
import * as cheerio from "cheerio";

const URL = "https://www.nibmworldwide.com/exams";
const REQUEST_TIMEOUT = 10000; // 10 seconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
const cache = new Map<string, { data: Exam[], timestamp: number }>();

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) { // Clean entries older than 2x cache duration
      cache.delete(key);
    }
  }
}, CACHE_DURATION); // Run cleanup every cache duration interval

export const GET = async ({ url }: { url: URL }): Promise<Response> => {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "999");
    const examName = url.searchParams.get("examName")?.trim() || "";
    
    const cacheKey = "exams";
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const filteredExams = examName
        ? cached.data.filter((exam) =>
          exam.title?.toLowerCase() === examName.toLowerCase()
        )
        : cached.data;
      return json(filteredExams.slice(0, limit));
    }
    
    const exams = await parseExams();
    
    // Cache the result
    cache.set(cacheKey, { data: exams, timestamp: Date.now() });
    
    const filteredExams = examName
      ? exams.filter((exam) =>
        exam.title?.toLowerCase() === examName.toLowerCase()
      )
      : exams;
    return json(filteredExams.slice(0, limit));
  } catch (error) {
    console.error("Error in exams API:", error);
    return json({ error: "Failed to fetch exams data" }, { status: 500 });
  }
};
const parseExams = async (): Promise<Exam[]> => {
  try {
    const { data } = await axios.get(URL, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    const $ = cheerio.load(data);
    const examRows = $("table.examlst > tbody > tr").toArray();
    const exams: Exam[] = [];
    for (const row of examRows) {
      try {
        const tds = $(row).find("td").toArray();
        if (tds.length < 3) continue;
        const td0Html = $(tds[0]).html();
        if (!td0Html) continue;
        const dateAndTime = td0Html.split("<br>");
        if (dateAndTime.length < 2) continue;
        const rawBatch = $(tds[1]).find("b").text().trim();
        const batch = rawBatch;
        const title = toTitleCase(
          $(tds[1])
            .find("small")
            .text()
            .replaceAll("(Special)", "")
            .trim(),
        );
        const is_special = $(tds[1]).find("small").text().includes("(Special)");
        const href = $(tds[2]).find("a").attr("href") || "";
        const fullUrl = `https://www.nibmworldwide.com/${href}`;
        exams.push({
          title,
          batch,
          date: dateAndTime[0].trim(),
          time: dateAndTime[1].trim(),
          url: fullUrl,
          is_special,
        });
      } catch (rowError) {
        console.warn("Error parsing exam row:", rowError);
        // Continue processing other rows
      }
    }
    exams.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    return exams;
  } catch (error) {
    console.error("Error fetching exam data:", error);
    throw new Error("Failed to fetch exam data from external source");
  }
};
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
