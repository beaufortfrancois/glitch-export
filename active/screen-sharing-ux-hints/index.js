captureButton.onclick = async () => {
  let constraints = {};
  if (video.value.trim().length) constraints.video = parse(video.value);
  if (displaySurface.value.trim().length)
    constraints.video = { displaySurface: parse(displaySurface.value) };
  if (audio.value.trim().length) constraints.audio = parse(audio.value);
  if (preferCurrentTab.value.trim().length)
    constraints.preferCurrentTab = parse(preferCurrentTab.value);
  if (selfBrowserSurface.value.trim().length)
    constraints.selfBrowserSurface = parse(selfBrowserSurface.value);
  if (systemAudio.value.trim().length)
    constraints.systemAudio = parse(systemAudio.value);
  if (surfaceSwitching.value.trim().length)
    constraints.surfaceSwitching = parse(surfaceSwitching.value);

  log(`Call navigator.mediaDevices.getDisplayMedia(${stringify(constraints)})`);
  const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

  log(`> Success! Got stream with ${stream.getTracks().length} track(s):`);
  stream.getTracks().forEach((track) => {
    log(
      `> Got ${track.kind} track "${track.label}" with ${stringify(
        track.getSettings()
      )}`
    );
  });

  previewVideo.srcObject = stream;
  previewVideo.setAttribute("controls", "");
  await previewVideo.play();

  // const recorder = new MediaRecorder(stream);
  // const chunks = [];
  // recorder.start();
  // recorder.ondataavailable = ({ data }) => {
  //   chunks.push(data);
  // };

  // downloadButton.disabled = false;
  // downloadButton.onclick = () => {
  //   recorder.stop();
  //   recorder.onstop = () => {
  //     const blob = new Blob(chunks);
  //     const anchor = document.createElement("a");
  //     anchor.href = URL.createObjectURL(blob);
  //     anchor.download = `video.webm`;
  //     anchor.click();
  //   };
  // };

  suppressLocalAudioPlaybackButton.disabled = false;
  suppressLocalAudioPlaybackButton.onclick = async () => {
    const [audioTrack] = stream.getAudioTracks();
    if (!audioTrack) {
      log(`> Error! An audio track is required`);
      return;
    }
    if (!("suppressLocalAudioPlayback" in audioTrack.getSettings())) {
      log(
        `> Error! The audio track does not support "suppressLocalAudioPlayback".`
      );
      return;
    }
    await audioTrack.applyConstraints({ suppressLocalAudioPlayback: true });
    log(
      `> Suppressed local audio playback in audio track "${audioTrack.label}"`
    );
  };
};

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}

function stringify(json) {
  return JSON.stringify(json, null, 2);
}

function parse(text) {
  if (text === "true") return true;
  if (text === "false") return false;
  return text;
}
