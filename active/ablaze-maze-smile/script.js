(async () => {
  // main.js:
  // Open camera.
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const [videoTrack] = stream.getVideoTracks();
const t = videoTrack.clone()
  // Process video in a worker.
  const worker = new Worker("worker.js");
  worker.postMessage({ videoTrack: t });
  const { data } = await new Promise((r) => worker.onmessage);

  // Show processed video to user.
  const video = document.querySelector("video");
  video.srcObject = new MediaStream([data.videoTrack]);
})();
