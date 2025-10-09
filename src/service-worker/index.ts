/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// @ts-nocheck
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const API_CACHE = `api-cache-${version}`;

const ASSETS = [
  ...build,
  ...files
];

const API_CACHE_DURATION = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }
  event.waitUntil((async () => {
    await addFilesToCache();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE && key !== API_CACHE) await caches.delete(key);
    }
  }

  event.waitUntil((async () => {
    await deleteOldCaches();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension://')) return;

  if (event.request.url.includes('manifest.json')) {
    return fetch(event.request);
  }

  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);
    const apiCache = await caches.open(API_CACHE);

    if (url.pathname.startsWith('/api/')) {
      try {
        const cachedResponse = await apiCache.match(event.request);
        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          const cacheTime = cachedData.cacheTime || 0;
          if (Date.now() - cacheTime < API_CACHE_DURATION) {
            return new Response(JSON.stringify(cachedData.data), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        const response = await fetch(event.request);
        if (response.status === 200) {
          const data = await response.clone().json();
          const cacheData = {
            data: data,
            cacheTime: Date.now()
          };
          
          await apiCache.put(event.request, new Response(JSON.stringify(cacheData), {
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        return response;
      } catch (error) {
        const cachedResponse = await apiCache.match(event.request);
        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          return new Response(JSON.stringify(cachedData.data), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw error;
      }
    }

    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname);
    }

    try {
      const response = await fetch(event.request);

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      return cache.match(event.request);
    }
  }

  event.respondWith(respond());
});

