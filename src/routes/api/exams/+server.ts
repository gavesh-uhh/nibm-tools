import { json } from "@sveltejs/kit";
import { fetchExams } from "$lib/services/exams";

export const GET = async ({ url }: { url: URL }): Promise<Response> => {
  try {
    const limit = parseInt(url.searchParams.get("limit") || "999");
    const examName = url.searchParams.get("examName")?.trim() || undefined;

    const exams = await fetchExams({ limit, examName });
    return json(exams);
  } catch (error) {
    console.error("Error in exams API:", error);
    return json({ error: "Failed to fetch exams data" }, { status: 500 });
  }
};
