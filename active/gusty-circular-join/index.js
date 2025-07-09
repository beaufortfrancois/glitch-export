let captureHandleUpdated = 0;

captureButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia();
  document.getElementById("video").srcObject = stream;
  const [videoTrack] = stream.getVideoTracks();
  videoTrack.oncapturehandlechange = (event) => {
    incrementCaptureHandleText();
  };
};

function incrementCaptureHandleText() {
  console.log('incrementCaptureHandleText');
  document.getElementById(
    "captureHandle"
  ).textContent = `Capture handle has changed ${++captureHandleUpdated} times.`;
}
