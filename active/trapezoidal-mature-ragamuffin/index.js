previewCurrentTabButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  video.srcObject = stream;
  cropToButton.disabled = false;
};

cropToButton.onclick = async () => {
  const [videoTrack] = video.srcObject.getVideoTracks();
  const cropId = await navigator.mediaDevices.produceCropId(innerRedRectangle);
  // Start cropping the video track to the coordinates of the |cropId| element
  await videoTrack.cropTo(cropId);
};
