import { json } from "@sveltejs/kit";
import axios from "axios";
import * as cheerio from "cheerio";

const URL = "https://www.nibmworldwide.com/exams";

export const GET = async ({ url }: { url: URL }): Promise<Response> => {
  const limit = parseInt(url.searchParams.get("limit") || "999");
  const examName = url.searchParams.get("examName")?.trim() || "";
  const exams = await parseExams();

  const filteredExams = examName
    ? exams.filter(exam => exam.title?.toLowerCase() === examName.toLowerCase())
    : exams;

  return json(filteredExams.slice(0, limit));
};

const parseExams = async (): Promise<Exam[]> => {
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);

  const replaceKeywords = ["/MT", "/KU", "/CO", "/RJ", "/NIC", "/RJ"];
  const uniqueKeywords = Array.from(new Set(replaceKeywords));
  const pattern = new RegExp(
    uniqueKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|"),
    "g"
  );

  const examRows = $("table.examlst > tbody > tr").toArray();
  const exams: Exam[] = [];

  for (const row of examRows) {
    const tds = $(row).find("td").toArray();
    if (tds.length < 3) continue;

    const td0Html = $(tds[0]).html();
    if (!td0Html) continue;
    const dateAndTime = td0Html.split("<br>");
    if (dateAndTime.length < 2) continue;

    const rawBatch = $(tds[1]).find("b").text().trim();
    const batch = rawBatch.replace(pattern, "").trim();

    const title = toTitleCase(
      $(tds[1])
        .find("small")
        .text()
        .replaceAll("(Special)", "")
        .trim()
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
      is_special
    });
  }

  exams.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return exams;
};

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

