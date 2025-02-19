import { json } from "@sveltejs/kit";


export const GET = async ({ url }: { url: URL }) => {
  const papers: Paper[] = [];
  const query = url.searchParams.get("q");

  if (!query) {
    return json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const fetchUrl = `https://nibmehub.com/opac-service/resources/online/v2/resources?role=4&languageCode=All&catalogueCode=11&pageSize=25&sortBy=id&sortOrder=desc&title=${query}`;

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=3600',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const data = await res.json();
    const content = data.content;

    content.forEach((element: {
      batch: string;
      nibmSubject: any;
      id: string;
      docName: string;
      title: any;
    }) => {
      papers.push({
        batch: element.title.split("-")[0] + " " + element.batch,
        title: element.batch + " " + element.title,
        subject: element.nibmSubject.name,
        url: 'https://nibmehub.com/opac-service/pdf/read/' + element.docName,
        thumbnail: 'https://nibmehub.com/opac-service/resources/downloadimage/' + element.id
      })
    });

    return json(papers);

  } catch (error) {
    return json({ error: (error as Error).message }, { status: 500 });
  }
}

