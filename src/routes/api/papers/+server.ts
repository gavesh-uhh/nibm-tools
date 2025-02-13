import { json } from "@sveltejs/kit";

export const GET = async ({ url }: { url: URL }) => {
  const papers: any[] = [];
  const query = url.searchParams.get("q");
  const fetchUrl = `https://nibmehub.com/opac-service/resources/online/v2/resources?role=4&languageCode=All&catalogueCode=11&pageSize=25&sortBy=id&sortOrder=desc&title=${query}`;
  const res = await fetch(fetchUrl);
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
      batch: element.batch,
      title: element.batch + " " + element.title,
      subject: element.nibmSubject.name,
      url: 'https://nibmehub.com/opac-service/pdf/read/' + element.docName,
      thumbnail: 'https://nibmehub.com/opac-service/resources/downloadimage/' + element.id
    })
  });

  return json(papers);
}
