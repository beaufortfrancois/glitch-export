const button = document.querySelector("button");
const video = document.querySelector("video");

let cropTarget;

window.onmessage = (event) => {
  cropTarget = event.data;
  button.disabled = false;
};

button.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  const [videoTrack] = stream.getVideoTracks();
  await videoTrack.cropTo(cropTarget);

  video.srcObject = stream;
};

video.onplaying = () => (button.hidden = true);
video.onsuspend = () => (button.hidden = false);
