navigator.mediaDevices?.enumerateDevices().then(mediaDevices => {
  const videoInputDevices = mediaDevices.filter(
    mediaDevice => mediaDevice.kind == "videoinput"
  );
  if (videoInputDevices.length > 0) {
    cameraSelect.disabled = false;
  }
  videoInputDevices.forEach((videoInputDevice, index) => {
    const option = document.createElement("option");
    option.id = videoInputDevice.deviceId;
    option.textContent = videoInputDevice.label || `Camera ${index + 1}`;
    cameraSelect.appendChild(option);
  });
});

let deviceId = "default";
cameraSelect.onchange = _ => {
  deviceId = cameraSelect.selectedOptions[0].id;
};

if (
  "mediaDevices" in navigator &&
  !("pan" in navigator.mediaDevices.getSupportedConstraints()) &&
  !("tilt" in navigator.mediaDevices.getSupportedConstraints())
) {
  warning.style.display = "block";
}

["pan", "tilt", "zoom"].forEach(name => {
  const prefix = `"${name}" in navigator.mediaDevices.getSupportedConstraints()`;
  try {
    log(
      `${prefix} -> ${name in navigator.mediaDevices.getSupportedConstraints()}`
    );
  } catch (error) {
    log(`${prefix} -> ${error.message}`);
  }
});

const monitoredPermissionDescriptors = [
  { name: "camera" },
  { name: "camera", panTiltZoom: true },
  { name: "microphone" }
];

monitoredPermissionDescriptors.forEach(async permissionDescriptor => {
  const prefix = `navigator.permissions.query(${JSON.stringify(
    permissionDescriptor
  )})`;
  function permissionStatusWithEmoji(status) {
    if (status.state === "prompt") return "🟠";
    if (status.state === "denied") return "🔴";
    if (status.state === "granted") return "🟢";
  }
  try {
    const status = await navigator.permissions.query(permissionDescriptor);
    log(`${prefix} -> ${permissionStatusWithEmoji(status)} "${status.state}"`);
    status.onchange = _ => {
      log(
        `${prefix}.onchange -> ${permissionStatusWithEmoji(status)} "${
          status.state
        }"`
      );
      updateButtons();
    };
  } catch (error) {
    log(`${prefix} -> ${error.message}`);
  }
});

getUserMediaVideoButton.onclick = _ => getUserMedia({ video: true });
// getUserMediaVideoPtzUnconstrainedButton.onclick = _ =>
//   getUserMedia({ video: { pan: {}, tilt: {}, zoom: {} } });
getUserMediaVideoPtzButton.onclick = _ =>
  getUserMedia({ video: { pan: 0, tilt: 0, zoom: 1 } });
getUserMediaVideoPtzAudioButton.onclick = _ =>
  getUserMedia({ video: { pan: 0, tilt: 0, zoom: 1 }, audio: true });

async function getUserMedia(constraints) {
  const sanitizedConstraints = { ...constraints };
  if (deviceId != "default") {
    constraints.video = { ...constraints.video, ...{ deviceId } };
    sanitizedConstraints.video = {
      ...constraints.video,
      ...{ deviceId: `${deviceId.substring(0, 4)}...` }
    };
  }
  const prefix = `navigator.mediaDevices.getUserMedia(${JSON.stringify(
    sanitizedConstraints
  )})`;
  try {
    document.body.classList.toggle("hidden", true);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    document.body.classList.toggle("hidden", false);

    const videoTrack = stream.getVideoTracks()[0];
    video.classList.toggle(
      "mirror",
      (videoTrack.facingMode === undefined ||
        videoTrack.facingMode === "user") &&
      !videoTrack.label.startsWith("Mock") && // Safari
        !videoTrack.label.startsWith("fake_device_") // Chrome
    );
    log(`${prefix} -> "${videoTrack.label}"`);

    video.srcObject?.getTracks().forEach(track => track.stop());
    video.srcObject = stream;

    await sleep(800); // crbug.com/711524
    updateButtons();
  } catch (error) {
    document.body.classList.toggle("hidden", false);
    log(`${prefix} -> ${error.message}`);
  }
}

function updateButtons() {
  const stream = video.srcObject;
  const videoTrack = stream.getVideoTracks()[0];
  const capabilities = videoTrack.getCapabilities();
  const settings = videoTrack.getSettings();

  ["pan", "tilt", "zoom"].forEach(name => {
    if (name in capabilities) {
      log(
        `videoTrack.getCapabilities().${name} -> { min: ${capabilities[name].min}, max: ${capabilities[name].max}, step: ${capabilities[name].step} }`
      );
      log(`videoTrack.getSettings().${name} -> ${settings[name]}`);
    } else {
      log(`"${name}" in videoTrack.getCapabilities() -> false`);
    }

    const buttons = Array.from(
      document.querySelectorAll(`[data-name="${name}"]`)
    );
    buttons.forEach(button => {
      button.disabled = !(name in videoTrack.getCapabilities());
    });
    if (name in videoTrack.getCapabilities()) {
      buttons.forEach(button => {
        button.onclick = onButtonClick;
      });
      if (name == "pan") {
        panLeftButton.dataset.step = -videoTrack.getCapabilities().pan.step;
        panRightButton.dataset.step = videoTrack.getCapabilities().pan.step;
      } else if (name == "tilt") {
        tiltUpButton.dataset.step = videoTrack.getCapabilities().tilt.step;
        tiltDownButton.dataset.step = -videoTrack.getCapabilities().tilt.step;
      } else if (name == "zoom") {
        zoomInButton.dataset.step = videoTrack.getCapabilities().zoom.step;
        zoomOutButton.dataset.step = -videoTrack.getCapabilities().zoom.step;
      }
    }
  });

  async function onButtonClick(event) {
    const name = event.target.dataset.name;
    if (!(name in videoTrack.getSettings())) {
      log(`Argh! "${name}" is not in videoTrack.getSettings() anymore.`);
    }
    event.target.disabled = true;
    const constraint =
      ("advanced" in videoTrack.getConstraints() &&
      name in videoTrack.getConstraints().advanced[0]
        ? videoTrack.getConstraints().advanced[0][name]
        : videoTrack.getSettings()[name]) +
      parseFloat(event.target.dataset.step);
    const constraints = { advanced: [{}] };
    constraints.advanced[0][name] = constraint.toFixed(1);
    const prefix = `videoTrack.applyConstraints({"advanced": [{"${name}": ${constraint.toFixed(
      1
    )}}]})`;
    try {
      await videoTrack.applyConstraints(constraints);
      log(`${prefix} -> success`);
    } catch (error) {
      log(`${prefix} -> ${error.message}`);
    }
    event.target.disabled = false;
  }
}

revokeCameraPtzTrueButton.onclick = _ =>
  revoke({ name: "camera", panTiltZoom: true });

async function revoke(permissionDescriptor) {
  const prefix = `navigator.permissions.revoke(${JSON.stringify(
    permissionDescriptor
  )}`;
  try {
    await navigator.permissions.revoke(permissionDescriptor);
    log(`${prefix} -> success`);
  } catch (error) {
    log(`${prefix} -> ${error.message}`);
  }
}

requestCameraPtzTrueButton.onclick = _ =>
  request({ name: "camera", panTiltZoom: true });

async function request(permissionDescriptor) {
  const prefix = `navigator.permissions.request(${JSON.stringify(
    permissionDescriptor
  )}`;
  try {
    await navigator.permissions.request(permissionDescriptor);
    log(`${prefix} -> success`);
  } catch (error) {
    log(`${prefix} -> ${error.message}`);
  }
}

preview.onclick = event => {
  if (!video.readyState || event.target != video) {
    return;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  preview.requestFullscreen();
};

cameraFeaturePolicy.checked = document.featurePolicy.allowsFeature("camera");
microphoneFeaturePolicy.checked = document.featurePolicy.allowsFeature(
  "microphone"
);

cameraFeaturePolicy.onchange = e => toggleFeaturePolicy(e, "camera");
microphoneFeaturePolicy.onchange = e => toggleFeaturePolicy(e, "microphone");

function toggleFeaturePolicy(event, featurePolicyName) {
  const params = new URLSearchParams(location.search);
  params.set(featurePolicyName, event.target.checked ? "self" : "none");
  location.href = `${location.pathname}?${params}`;
}

/* utils */

function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

function log(text) {
  logs.scrollTop = 0;
  if (text == logs.firstChild?.textContent) {
    logs.firstChild.classList.toggle("again", true);
    logs.firstChild.dataset.times =
      (parseInt(logs.firstChild.dataset.times) || 0) + 1;
    return;
  }
  const pre = document.createElement("pre");
  pre.textContent = `${text}`;
  pre.style.transition = ".5s";
  pre.style.opacity = 0;
  logs.insertBefore(pre, logs.firstChild);
  requestAnimationFrame(_ => {
    requestAnimationFrame(_ => {
      pre.style.opacity = 1;
    });
  });
}
