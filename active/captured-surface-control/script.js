let controller;
let forwarding = false;

if (!!window.CaptureController?.prototype.forwardWheel) {
  mainContent.hidden = false;
  setVisibleInstruction("clickToShareInstructions");
} else {
  failureWarning.hidden = false;
}

video.onclick = () => {
  if (!controller) {
    startSharing();
  } else if (!forwarding) {
    startForwarding();
  }
};

async function startSharing() {
  controller = new CaptureController();
  controller.setFocusBehavior("focus-capturing-application");

  let stream;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      controller,
      video: { frameRate: 120 },
    });
  } catch (e) {
    log(e);
    controller = null;
    return;
  }

  const [track] = stream.getVideoTracks();
  if (track.getSettings().displaySurface !== "browser") {
    setVisibleInstruction("shareTabWarning");
    log("This demo only works with a tab.");
    track.stop();
    controller = null;
    return;
  }

  video.srcObject = stream;
  track.onended = () => window.location.reload();
  video.classList.add("playing");

  // Update UX.
  buttons.classList.remove("hidden");
  setVisibleInstruction("clickToPermit");

  // Hook up zoom controls.
  currentZoomLabel.textContent = `${controller.zoomLevel}%`;

  controller.onzoomlevelchange = () =>
    (currentZoomLabel.textContent = `${controller.zoomLevel}%`);

  zoomMinusButton.onclick = wrapWithCatch(
    controller.decreaseZoomLevel.bind(controller)
  );
  zoomPlusButton.onclick = wrapWithCatch(
    controller.increaseZoomLevel.bind(controller)
  );
  resetZoomLevelButton.onclick = wrapWithCatch(
    controller.resetZoomLevel.bind(controller)
  );
}

async function startForwarding() {
  if (forwarding) {
    return;
  }

  try {
    await controller.forwardWheel(video);
    forwarding = true;
    setVisibleInstruction("scrollInstructions");
  } catch (e) {
    log(e);
  }
}

function setVisibleInstruction(instruction) {
  [
    "clickToShareInstructions",
    "clickToPermit",
    "scrollInstructions",
    "shareTabWarning",
  ].forEach((elementId) => {
    const element = document.getElementById(elementId);
    element.style.opacity = instruction != elementId ? 0 : 1;
    element.hidden = false;
  });
}

function wrapWithCatch(func) {
  return async () => {
    try {
      await func();
    } catch (e) {
      log(e);
    }
  };
}

function log(str) {
  logs.textContent = str;
}
