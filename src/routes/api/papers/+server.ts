import { json } from "@sveltejs/kit";

export const GET = async ({ url }: { url: URL }) => {
  return json({
    v1: "Working..."
  })
}
