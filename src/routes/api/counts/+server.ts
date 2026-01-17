import { json } from "@sveltejs/kit";

export const GET = async ({ url }: { url: URL }) => {
  const date = url.searchParams.get("date");
  if (!date) {
    return json({ message: "Date value required" });
  }

  const LECTURE_ENDPOINT = "./api/lectures?date=" + date;

  // TODO - IMP#1
  // - Export the lecture fetching func 
  // - Export the url generation to seperate func
  // 
  
  return json({ endpoint: LECTURE_ENDPOINT });
};
