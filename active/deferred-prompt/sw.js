self.addEventListener("install", e => {
  self.skipWaiting();
});

// self.addEventListener("activate", e => {
//   return self.clients.claim();
// });

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
        console.log('enable preload')
      }
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // e.respondWith(fetch(e.request).catch(() => new Response("offline")));

  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (e.request.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          console.log('1');
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await e.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          console.log('2');
          // Always try the network first.
          const networkResponse = await fetch(e.request);
          return networkResponse;
        } catch (error) {
          console.log('3');
          // catch is only triggered if an exception is thrown, which is likely
          // due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log("Fetch failed; returning offline page instead.", error);

          return new Response('offline');
        }
      })()
    );
  }
});
