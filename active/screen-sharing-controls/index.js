captureButton.onclick = async () => {
  let constraints = {};
  if (video.value.trim().length) constraints.video = parse(video.value);
  if (displaySurface.value.trim().length)
    constraints.video = { displaySurface: parse(displaySurface.value) };
  if (audio.value.trim().length) constraints.audio = parse(audio.value);
  if (suppressLocalAudioPlayback.value.trim().length)
    constraints.audio = { suppressLocalAudioPlayback: parse(suppressLocalAudioPlayback.value) };
  if (preferCurrentTab.value.trim().length)
    constraints.preferCurrentTab = parse(preferCurrentTab.value);
  if (selfBrowserSurface.value.trim().length)
    constraints.selfBrowserSurface = parse(selfBrowserSurface.value);
  if (systemAudio.value.trim().length)
    constraints.systemAudio = parse(systemAudio.value);
  if (surfaceSwitching.value.trim().length)
    constraints.surfaceSwitching = parse(surfaceSwitching.value);
  if (monitorTypeSurfaces.value.trim().length)
    constraints.monitorTypeSurfaces = parse(monitorTypeSurfaces.value);

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
  previewVideo.muted = constraints.audio?.suppressLocalAudioPlayback;
  await previewVideo.play();
};

resetButton.onclick = () => {
  location = location.origin;
}

/* Utils */

function log(text) {
  let p = document.createElement("p");
  p.textContent = text;
  logs.appendChild(p);
}

function stringify(json) {
  return JSON.stringify(json, null, 2);
}

function parse(text) {
  if (text === "true") return true;
  if (text === "false") return false;
  return text;
}
