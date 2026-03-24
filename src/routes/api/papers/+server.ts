import { json } from "@sveltejs/kit";
import { fetchPapers } from "$lib/services/papers";

export const GET = async ({ url }: { url: URL }) => {
  try {
    const query = url.searchParams.get("q");

    if (!query) {
      return json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const papers = await fetchPapers(query);
    return json(papers);

  } catch (error: any) {
    console.error("Error in papers API:", error);
    if (error.name === 'AbortError') {
      return json({ error: "Request timeout - papers service took too long to respond" }, { status: 408 });
    }
    return json({ error: "Failed to fetch papers data" }, { status: 500 });
  }
};
