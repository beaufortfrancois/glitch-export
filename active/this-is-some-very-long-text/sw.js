self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  return self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.url.endsWith("/?start_url")) {
    e.respondWith(new Response("foo"));
    return;
  }
  e.respondWith(fetch(e.request));
});
