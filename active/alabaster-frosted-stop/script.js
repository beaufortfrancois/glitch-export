button.onclick = async function () {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const [videoTrack] = stream.getVideoTracks();

  const capabilities = videoTrack.getCapabilities();
  if ("backgroundBlur" in capabilities && capabilities.includes(true)) {
    // The platform supports background blurring.
    // Let's use platform background blurring.
    // No transformers are needed.
    await videoTrack.applyConstraints({
      advanced: [{ backgroundBlur: true }],
    });
    videoElement.srcObject = stream;
  }
};

button.onclick = async function () {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const [videoTrack] = stream.getVideoTracks();

  // Use a video worker and show to user.
  const videoElement = document.querySelector("video");
  const videoWorker = new Worker("video-worker.js");

  videoWorker.postMessage({ videoTrack: videoTrack }, [videoTrack]);
  const { data } = await new Promise((r) => videoWorker.onmessage);
  videoElement.srcObject = new MediaStream([data.videoTrack]);
};
