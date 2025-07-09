captureButton.onclick = async () => {
  const controller = new CaptureController();
  const options = {
    selfBrowserSurface: "exclude", // Exclude the current tab from the list of tabs offered to the user.
    controller: controller,
  };

  log("Prompt the user to choose what to share...");
  const stream = await navigator.mediaDevices.getDisplayMedia(options);
  document.querySelector("video").srcObject = stream;
  const [track] = stream.getVideoTracks();
  const surface = track.getSettings().displaySurface;

  let focusBehavior;
  if (surface == "browser") {
    const focusTabs = document.querySelector("#focusTabs").checked;
    focusBehavior = focusTabs ? "focus-captured-surface" : "no-focus-change";
  } else if (surface == "window") {
    const focusWindows = document.querySelector("#focusWindows").checked;
    focusBehavior = focusWindows ? "focus-captured-surface" : "no-focus-change";
  }

  if (!focusBehavior) {
    log("> Screen cannot be focused - no action taken.");
    return;
  }

  const decisionAsString =
    focusBehavior == "focus-captured-surface" ? "Focusing" : "Not focusing";
  const surfaceAsString = surface == "browser" ? "tab" : "window";
  log(`> ${decisionAsString} the captured ${surfaceAsString}.`);

  controller.setFocusBehavior(focusBehavior);
};

/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
