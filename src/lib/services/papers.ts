const REQUEST_TIMEOUT = 10000;
const CACHE_DURATION = 10 * 60 * 1000;

const cache = new Map<string, { data: Paper[]; timestamp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

export const fetchPapers = async (query: string): Promise<Paper[]> => {
  const cacheKey = `papers-${query}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const papers: Paper[] = [];
  const fetchUrl = `https://nibmehub.com/opac-service/resources/online/v2/resources?role=4&languageCode=All&catalogueCode=11&pageSize=25&sortBy=id&sortOrder=desc&title=${encodeURIComponent(query)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const res = await fetch(fetchUrl, {
    signal: controller.signal,
    headers: {
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=3600',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const content = data.content || [];

  content.forEach((element: {
    batch: string;
    nibmSubject: any;
    id: string;
    docName: string;
    title: any;
  }) => {
    try {
      papers.push({
        batch: element.title.split("-")[0] + " " + element.batch,
        title: element.batch + " " + element.title,
        subject: element.nibmSubject?.name || "Unknown Subject",
        url: 'https://nibmehub.com/opac-service/pdf/read/' + element.docName,
        thumbnail: 'https://nibmehub.com/opac-service/resources/downloadimage/' + element.id
      });
    } catch (itemError) {
      console.warn("Error processing paper item:", itemError);
    }
  });

  cache.set(cacheKey, { data: papers, timestamp: Date.now() });

  return papers;
};
