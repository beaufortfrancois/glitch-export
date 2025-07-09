const button = document.querySelector("button");
const target = document.getElementById("target");
const video = document.querySelector("video");

button.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  const [videoTrack] = stream.getVideoTracks();

  const restrictionTarget = await RestrictionTarget.fromElement(target);

  await videoTrack.restrictTo(restrictionTarget);

  video.srcObject = stream;
};
