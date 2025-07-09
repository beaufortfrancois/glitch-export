let detector;
let url = new URL(self.location);
if (url.searchParams.has('text')) detector = new TextDetector();
if (url.searchParams.has('barcode')) detector = new BarcodeDetector();
if (url.searchParams.has('face')) detector = new FaceDetector();

self.onmessage = async (event) => {
  const results = await detector.detect(event.data.frame);
  self.postMessage({ results });
}
