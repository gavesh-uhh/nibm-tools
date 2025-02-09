import { json } from "@sveltejs/kit";
import axios from "axios";
import * as cheerio from "cheerio";

const SCRAPE_URL = "https://lms.nibmworldwide.com/mod/nibm/display.php";
const SUPPORTED_BRANCHES = [
  { keyword: "CO", name: "SOC" },
  { keyword: "NIC", name: "NIC" },
  { keyword: "RJ", name: "SOB" }
];

export const GET = async ({ url }: { url: URL }): Promise<Response> => {
  const date = url.searchParams.get("date");
  const day_limit = parseInt(url.searchParams.get("limit") ?? "3");
  if (!date) return json({ error: "Date is required" }, { status: 400 });
  const requests: Promise<Lecture[]>[] = [];

  for (let i = 0; i < day_limit; i++) {
    const futureDate = getOffsettedDate(date, i);
    const branchRequests = SUPPORTED_BRANCHES.map((branch) =>
      fetchData(`${SCRAPE_URL}?wing=${branch.keyword}&date=${futureDate}`, branch.name, i)
    );
    requests.push(...branchRequests);
  }

  const results = await Promise.all(requests);
  return json(results.flat());
};

const fetchData = async (url: string, branch: string, offset: number): Promise<Lecture[]> => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    return $("div.swiper-slide > table > tbody > tr")
      .map((_, row) => {
        const tds = $(row).find("td");
        if (tds.length < 3) return null;

        const batch = $(tds[0]).text().trim().replace("/CO", "");
        const location_Hall = $(tds[1]).find("big").toArray().map((big) => $(big).text().trim());
        const location_Floor = cleanLocation(
          $(tds[1]).last().text().replace(location_Hall.join(" "), "").trim()
        );
        const [time, lecturer] = $(tds[2]).find("big").toArray().map((big) => $(big).text().trim());

        return {
          title: $(tds[2]).contents().last().text().trim(),
          batch: batch.trim() == "REPEATERS" ? "Repeating Exam" : batch.trim(),
          lecturer: lecturer.trim() == "EXAM" ? "None" : lecturer.trim(),
          offset,
          location: {
            hall: capitalizeFirstLetter(location_Hall.toString()),
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
        };
      })
      .get()
      .filter(Boolean) as Lecture[];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const removeDuplicates = (str: string) => {
  const words = str.split(' ');
  const uniqueWords = [...new Set(words)];
  return uniqueWords.join(' ');
}

const trimDate = (timeString: string): string => timeString.replace(/(am|pm)/gi, "").trim();

const cleanLocation = (text: string): string => {
  const blacklist = new Set(["CO", "NIC", "SOC", "SOB", "/"]);
  return text.split(" ").filter((word) => !blacklist.has(word)).join(" ").trim();
};

const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

const getOffsettedDate = (startDate: string, offset: number): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
};

