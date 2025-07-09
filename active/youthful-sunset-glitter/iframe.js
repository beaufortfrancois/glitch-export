const button = document.querySelector("button");
const video = document.querySelector("video");

let target;

window.onmessage = (event) => {
  target = event.data;
  console.log(`Got ${target}`)
  button.disabled = false;
};

button.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  const [videoTrack] = stream.getVideoTracks();
  await videoTrack.restrictTo(target);

  video.srcObject = stream;
};

video.onplaying = () => (button.hidden = true);
video.onsuspend = () => (button.hidden = false);
