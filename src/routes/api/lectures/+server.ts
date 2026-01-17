import { json } from "@sveltejs/kit";
import axios from "axios";
import * as cheerio from "cheerio";

const SCRAPE_URL = "https://lms.nibmworldwide.com/mod/nibm/display.php";
const REQUEST_TIMEOUT = 15000; 
const CONCURRENT_LIMIT = 3; 

const SUPPORTED_BRANCHES = [
  { keyword: "CO", name: "SOC" },
  { keyword: "NIC", name: "NIC" },
  { keyword: "RJ", name: "SOB" },
  { keyword: "KD", name: "KD" },
  { keyword: "KIC", name: "KIC" },
];

const cache = new Map<string, { data: Lecture[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; 

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) cache.delete(key);
  }
}, CACHE_DURATION);

export const GET = async ({ url }: { url: URL }): Promise<Response> => {
  const startedAt = Date.now();
  const date = url.searchParams.get("date");
  const day_limit = parseInt(url.searchParams.get("limit") ?? "3");
  const batch = url.searchParams.get("batch");
  const branchFilter = url.searchParams.get("branch");
  if (!date) return json({ error: "Date is required" }, { status: 400 });

  const cacheKey = `${date}-${day_limit}-${batch || "all"}-${branchFilter || "all"}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    const tookMs = Date.now() - startedAt;
    console.log("[NIBM:Toolkit] Cache hit for key:", cacheKey);
    return json(cached.data, {
      headers: {
        "x-cache": "HIT",
        "x-duration-ms": String(tookMs),
        "x-count": String(cached.data.length)
      }
    });
  }

  const requestPlan: Array<{ url: string; branch: string; offset: number }> = [];
  for (let i = 0; i < day_limit; i++) {
    const futureDate = getOffsettedDate(date, i);
    const branches = branchFilter
      ? SUPPORTED_BRANCHES.filter((b) => b.name === branchFilter)
      : SUPPORTED_BRANCHES;
    for (const b of branches) {
      requestPlan.push({ url: `${SCRAPE_URL}?wing=${b.keyword}&date=${futureDate}`, branch: b.name, offset: i });
    }
  }

  const results: Lecture[] = [];
  for (let i = 0; i < requestPlan.length; i += CONCURRENT_LIMIT) {
    const slice = requestPlan.slice(i, i + CONCURRENT_LIMIT);
    const batchResults = await Promise.all(
      slice.map((req) => fetchDataWithRetry(req.url, req.branch, req.offset))
    );
    results.push(...batchResults.flat());
    if (i + CONCURRENT_LIMIT < requestPlan.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  const filtered = batch
    ? results.filter((lecture) => lecture.batch && lecture.batch.includes(batch))
    : results;

  cache.set(cacheKey, { data: filtered, timestamp: Date.now() });
  const tookMs = Date.now() - startedAt;
 
  return json(filtered, {
    headers: {
      "x-cache": "MISS",
      "x-duration-ms": String(tookMs),
      "x-count": String(filtered.length)
    }
  });
};

const fetchDataWithRetry = async (
  url: string,
  branch: string,
  offset: number,
  retries = 3
): Promise<Lecture[]> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchData(url, branch, offset);
    } catch (error) {
      if (attempt === retries - 1) {
        console.error(`Failed after ${retries} attempts:`, error);
        return [];
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return [];
};

const fetchData = async (url: string, branch: string, offset: number): Promise<Lecture[]> => {
  const { data } = await axios.get(url, {
    timeout: REQUEST_TIMEOUT,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  const $ = cheerio.load(data);

  return $("div.swiper-slide > table > tbody > tr")
    .map((_, row) => {
      try {
        const tds = $(row).find("td");
        if (tds.length < 3) return null;
        const batches = $(tds[0])
          .find("div > big > b")
          .toArray()
          .map((div) => $(div).text().trim().replaceAll("/CO", "").trim())
          .filter((x) => x !== "");
        const location_Hall = $(tds[1])
          .find("big")
          .toArray()
          .map((big) => $(big).text().trim());

        const hallJoined = location_Hall.join(" ");
        const location_Floor = cleanLocation($(tds[1]).last().text().replace(hallJoined, "").trim());

        const bigTexts = $(tds[2])
          .find("big")
          .toArray()
          .map((big) => $(big).text().trim());
        if (bigTexts.length < 2) return null;
        const [time, lecturer] = bigTexts;

        return {
          title: $(tds[2]).contents().last().text().trim(),
          batch: batches,
          lecturer: lecturer.trim() === "EXAM" ? "None" : lecturer.trim(),
          offset,
          location: {
            hall: capitalizeFirstLetter(hallJoined),
            floor: removeDuplicates(location_Floor)
          },
          time: {
            start: trimDate(time.split("-")[0].trim()),
            end: trimDate(time.split("-")[1].trim())
          },
          properties: {
            is_exam: lecturer.toLowerCase() === "exam",
            branch: branch.trim()
          }
        } as Lecture;
      } catch {
        return null;
      }
    })
    .get()
    .filter(Boolean) as Lecture[];
};

const removeDuplicates = (str: string) => {
  const words = str.split(" ");
  const uniqueWords = [...new Set(words)];
  return uniqueWords.join(" ");
};

const trimDate = (timeString: string): string => timeString.replace(/(am|pm)/gi, "").trim();

const cleanLocation = (text: string): string => {
  const blacklist = new Set(["CO", "NIC", "SOC", "SOB", "/"]);
  return text
    .split(" ")
    .filter((word) => !blacklist.has(word))
    .join(" ")
    .trim();
};

const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

const getOffsettedDate = (startDate: string, offset: number): string => {
  const [year, month, day] = startDate.split("-").map((str) => parseInt(str));
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

export {
  fetchData
}
