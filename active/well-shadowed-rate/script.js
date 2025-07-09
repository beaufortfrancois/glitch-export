let permissionGranted = false;
let controller;

if (!!window.CaptureController?.prototype.sendWheel) {
  mainContent.hidden = false;
  setVisibleInstruction("clickToShareInstructions");
} else {
  failureWarning.hidden = false;
}

video.onclick = () => {
  if (!controller) {
    startSharing().catch(() => (controller = null));
  } else {
    maybeAskForPermission();
  }
};

async function startSharing() {
  controller = new CaptureController();
  controller.setFocusBehavior("focus-capturing-application");

  const stream = await navigator.mediaDevices.getDisplayMedia({
    controller,
    video: { frameRate: 120 },
  });

  const [track] = stream.getVideoTracks();
  if (track.getSettings().displaySurface !== "browser") {
    track.stop();
    setVisibleInstruction("shareTabWarning");
    throw new Error("This demo only works with a tab.");
  }

  video.srcObject = stream;
  track.onended = () => window.location.reload();
  video.classList.add("playing");
  buttons.classList.remove("hidden");
  setVisibleInstruction("clickToPermit");

  currentZoomLabel.textContent = `${controller.getZoomLevel()}%`;

  controller.oncapturedzoomlevelchange = () => {
    currentZoomLabel.textContent = `${controller.getZoomLevel()}%`;
  };

  zoomMinusButton.onclick = () => {
    const newZoomLevel = CaptureController.getSupportedZoomLevels()
      .toReversed()
      .find((zoomLevel) => zoomLevel < parseInt(currentZoomLabel.textContent));
    if (newZoomLevel) updateZoomLevel(newZoomLevel);
  };

  zoomPlusButton.onclick = () => {
    const newZoomLevel = CaptureController.getSupportedZoomLevels().find(
      (zoomLevel) => zoomLevel > parseInt(currentZoomLabel.textContent)
    );
    if (newZoomLevel) updateZoomLevel(newZoomLevel);
  };

  async function updateZoomLevel(zoomLevel) {
    await maybeAskForPermission();
    await controller.setZoomLevel(zoomLevel);
  }
}

async function maybeAskForPermission() {
  if (!controller || permissionGranted) {
    return;
  }

  await controller.sendWheel({});
  permissionGranted = true;
  setVisibleInstruction("scrollInstructions");

  video.onwheel = async (event) => {
    const [x, y] = translateCoordinates(event.offsetX, event.offsetY);
    const [wheelDeltaX, wheelDeltaY] = [-event.deltaX, -event.deltaY];
    try {
      await controller.sendWheel({ x, y, wheelDeltaX, wheelDeltaY });
      setVisibleInstruction("");
    } catch (error) {
      logs.textContent = `> Error: ${error}`;
    }
  };
}

showScrollInstructionsButton.onclick = async () => {
  await maybeAskForPermission();
  setVisibleInstruction("scrollInstructions");
};

/* Utils */

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

function translateCoordinates(offsetX, offsetY) {
  const previewDimensions = video.getBoundingClientRect();
  const trackSettings = video.srcObject.getVideoTracks()[0].getSettings();

  const x = (trackSettings.width * offsetX) / previewDimensions.width;
  const y = (trackSettings.height * offsetY) / previewDimensions.height;

  return [Math.floor(x), Math.floor(y)];
}
