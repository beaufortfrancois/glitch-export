startButton.onclick = async () => {
  // Get display media stream
  const stream = await navigator.mediaDevices.getDisplayMedia();

  // Start recording
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm; codecs=vp9"
  });
  recorder.start(0);

  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);

  stopButton.onclick = () => {
    // Stop recording
    recorder.stop();

    // Prompt user to save video file.
    recorder.onstop = async e => {
      const fileHandle = await window.chooseFileSystemEntries({
        type: "saveFile",
        accepts: [{ mimeTypes: ["video/webm"] }]
      });

      const blob = new Blob(chunks, { type: "video/webm; codecs=vp9" });
      const buffer = await blob.arrayBuffer();

      const fileWriter = await fileHandle.createWriter();
      await fileWriter.write(0, buffer);
      await fileWriter.close();

      stream.getVideoTracks()[0].stop();
    };
  };
};
