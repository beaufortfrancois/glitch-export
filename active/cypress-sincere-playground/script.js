buttonElement.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    preferCurrentTab: true,
  });
  const [track] = stream.getVideoTracks();

  const cropTarget = await CropTarget.fromElement(cropTargetElement);
  await track.cropTo(cropTarget);

  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = ({ data }) => {
    chunks.push(data);
  };

  // Record 5 seconds...
  recorder.start();
  await new Promise((r) => setTimeout(r, 5000));
  recorder.stop();

  recorder.onstop = () => {
    const blob = new Blob(chunks);
    videoElement.src = URL.createObjectURL(blob);
    
    track.stop();
  };
};
