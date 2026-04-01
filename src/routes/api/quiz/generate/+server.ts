import { json } from "@sveltejs/kit";
import { generateQuestionsStreamFromPapers } from "$lib/services/gemini";

export const POST = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json();
    const { papers, count = 5, questionType = "Theory", additionalContext = "" } = body;

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return json({ error: "No papers provided" }, { status: 400 });
    }

    // Fetch all PDF files and encode to base64
    const pdfs = await Promise.all(
      papers.map(async (paper: any) => {
        const response = await fetch(paper.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch paper from ${paper.url}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        return {
          base64,
          name: paper.subject || paper.title || "Unknown Paper"
        };
      })
    );

    const stream = await generateQuestionsStreamFromPapers(pdfs, count, questionType, additionalContext);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(chunk.text);
            }
          }
          controller.close();
        } catch (e) {
          console.error("Gemini stream error:", e);
          controller.error(e);
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      }
    });

  } catch (error: any) {
    console.error("Error in quiz generation:", error);
    return json({ error: error.message || "Failed to generate questions" }, { status: 500 });
  }
};
