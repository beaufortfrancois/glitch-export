let innerGreenRectangleCropTarget;
let clonedVideos = [];

previewCurrentTabButton.onclick = async () => {
  video.srcObject?.getTracks().forEach((track) => track.stop());
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  video.srcObject = stream;
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
  });
};

cropToRedRectangleButton.onclick = async () => {
  const innerRedRectangleCropTarget = await CropTarget.fromElement(
    innerRedRectangle
  );
  cropTo(innerRedRectangleCropTarget);
};

cropToGreenRectangleButton.onclick = () => {
  cropTo(innerGreenRectangleCropTarget);
};

uncropButton.onclick = async () => {
  cropTo(null);
};

async function cropTo(cropTarget) {
  const [videoTrack] = video.srcObject.getVideoTracks();
  log(`cropTarget: ${JSON.stringify(cropTarget)}`);
  await videoTrack.cropTo(cropTarget);
}

cloneButton.onclick = async () => {
  const [videoTrack] = video.srcObject.getVideoTracks();
  const clonedVideoTrack = await videoTrack.clone();
  const clonedVideo = document.createElement("video");
  clonedVideo.autoplay = true;
  clonedVideo.muted = true;
  clonedVideo.srcObject = new MediaStream([clonedVideoTrack]);
  document.body.appendChild(clonedVideo);
  clonedVideos.push(clonedVideo);
};

uncloneButton.onclick = async () => {
  const lastClonedVideo = clonedVideos.pop();
  lastClonedVideo.srcObject.getTracks().forEach((track) => track.stop());
  lastClonedVideo.srcObject = null;
  lastClonedVideo.remove();
};

toggleRedRectangleVisibilityButton.onclick = async () => {
  innerRedRectangle.hidden = !innerRedRectangle.hidden;
};

iframe.src = "iframe.html";
window.onmessage = ({ data }) => {
  innerGreenRectangleCropTarget = data.innerGreenRectangleCropTarget;
};

/* Fun: Monitoring video coded width */

video.onplaying = async (event) => {
  let lastCodedWidth = 0;

  const [videoTrack] = video.srcObject.getVideoTracks();
  const trackProcessor = new MediaStreamTrackProcessor({ track: videoTrack });
  const reader = trackProcessor.readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      reader.releaseLock();
      break;
    }
    if (lastCodedWidth != value.codedWidth) {
      log(`videoFrame.codedWidth: ${value.codedWidth}`);
    }
    lastCodedWidth = value.codedWidth;
    value.close();
  }
};

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
