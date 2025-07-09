let audioContext;

changeOutputButton.onclick = async () => {
  const sinkId = deviceIdToSinkId(devicesDropdown.value);
  await audioContext.setSinkId(sinkId);
  if ('getSinkId' in audioContext) {
  log(`audioContext.getSinkId() = ${JSON.stringify(audioContext.getSinkId())}`);
  } else {
  log(`audioContext.sinkId = ${JSON.stringify(audioContext.sinkId)}`);
  }
};

getAudioOutputsButton.onclick = async () => {
  try {
    // More audio outputs are available when user grants access to the microphone.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
  } finally {
    populateDropdown();
    if (!audioContext) playSound();
  }
};

async function populateDropdown() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioOutputs = devices.filter((device) => device.kind == "audiooutput");

  devicesDropdown.innerHTML =
    audioOutputs.map((device) => createOption(device)).join("") +
    createOption({ deviceId: "silent", label: "No output" });
  devicesDropdown.disabled = false;
  changeOutputButton.disabled = false;
}

function playSound() {
  audioContext = new AudioContext();
  const osc = new OscillatorNode(audioContext);
  const amp = new GainNode(audioContext, { gain: 0.03 });
  osc.connect(amp).connect(audioContext.destination);
  osc.start();
  log("Playing sound...");
}

/* Utils */

function deviceIdToSinkId(deviceId) {
  if (deviceId === "default") return "";
  if (deviceId === "silent") return { type: "none" };
  return deviceId;
}

function log(text) {
  logs.textContent += `${text}\r\n`;
}

function createOption({ deviceId, label }) {
  return `<option value="${deviceId}">${label || "Default"}</option>`;
}
