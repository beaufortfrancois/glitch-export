importScripts('./idb-keyval.js');

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const slowStream = (chunkSize, delay) =>
  new TransformStream({
    async transform(chunk, controller) {
      for (let pos = 0; pos < chunk.length; pos += chunkSize) {
        await wait(delay);
        controller.enqueue(chunk.subarray(pos, pos + chunkSize));
      }
    },
  });

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

function slowResponse(url, event) {
  const chunkSize = Number(url.searchParams.get('chunkSize'));
  const delay = Number(url.searchParams.get('delay'));
  const index = Number(url.searchParams.get('i')) || 0;
  
  if (!chunkSize || !delay) return;

  event.respondWith(
    (async () => {
      const file = (await idbKeyval.get('imgs'))[index];
      const stream = file.stream().pipeThrough(slowStream(chunkSize, delay));
      return new Response(stream);
    })(),
  );
}

function partialResponse(url, event) {
  const index = Number(url.searchParams.get('i')) || 0;
  const end = Number(url.searchParams.get('end'));
  const chunkSize = Number(url.searchParams.get('chunkSize'));
  const delay = Number(url.searchParams.get('delay')) || 0;
  
  if (!end) return;
  
  event.respondWith(
    (async () => {
      const partialFile = new ReadableStream({
        async start(controller) {
          const file = (await idbKeyval.get('imgs'))[index];
          const buffer = await file.slice(0, end).arrayBuffer();
          controller.enqueue(new Uint8Array(buffer));
        }
      });
      
      const stream = chunkSize ?
        partialFile.pipeThrough(slowStream(chunkSize, delay)) : partialFile;
      return new Response(stream);
    })(),
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.destination !== 'image') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  
  if (url.pathname === '/slow-img') {
    slowResponse(url, event);
    return;
  }
  if (url.pathname === '/partial-img') {
    partialResponse(url, event);
    return;
  }
});