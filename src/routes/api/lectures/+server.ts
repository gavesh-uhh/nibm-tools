import { json } from "@sveltejs/kit";
import { fetchLectures } from "$lib/services/lectures";

export const GET = async ({ url }: { url: URL }): Promise<Response> => {
  const date = url.searchParams.get("date");
  const limit = parseInt(url.searchParams.get("limit") ?? "3");
  const batch = url.searchParams.get("batch") || undefined;
  const branch = url.searchParams.get("branch") || undefined;

  if (!date) return json({ error: "Date is required" }, { status: 400 });

  const result = await fetchLectures({ date, limit, batch, branch });

  return json(result.data, {
    headers: {
      "x-cache": result.cacheHit ? "HIT" : "MISS",
      "x-duration-ms": String(result.durationMs),
      "x-count": String(result.data.length)
    }
  });
};
