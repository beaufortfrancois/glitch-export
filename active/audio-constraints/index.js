captureButton.onclick = async () => {
  let constraints = {};
  if (audio.value.trim().length) constraints.audio = parse(audio.value);
  if (echoCancellation.value.trim().length)
    constraints.audio = { echoCancellation: parse(echoCancellation.value) };
  if (autoGainControl.value.trim().length)
    constraints.audio = { autoGainControl: parse(autoGainControl.value) };
  if (noiseSuppression.value.trim().length)
    constraints.audio = { noiseSuppression: parse(noiseSuppression.value) };

  log(`Call navigator.mediaDevices.getUserMedia(${stringify(constraints)})`);
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  log(`> Success! Got stream with ${stream.getTracks().length} track(s):`);
  stream.getTracks().forEach((track) => {
    log(
      `> Got ${track.kind} track "${track.label}" with ${stringify(
        track.getSettings()
      )}`
    );
  });
};

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}

function stringify(json) {
  return JSON.stringify(json, null, 2);
}

function parse(text) {
  if (text === "true") {
    return true;
  } else if (text === "false") {
    return false;
  } else {
    return text;
  }
}
