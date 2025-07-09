addEventListener('install', () => {
  skipWaiting();
});

addEventListener('activate', () => {
  clients.claim();
});

let pausedFetches = [];

addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (!url.searchParams.has('pause')) return;
  
  event.respondWith((async () => {
    await new Promise((resolve) => {
      pausedFetches.push(resolve);
    });
    
    return fetch(event.request);
  })());
});

addEventListener('message', (event) => {
  if (event.data === 'unpause') {
    for (const resolve of pausedFetches) resolve();
    pausedFetches = [];
  }
});