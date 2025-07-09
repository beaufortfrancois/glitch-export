async function togglePictureInPicture() {
  // Close Picture-in-Picture window if any.
  if (documentPictureInPicture.window) {
    documentPictureInPicture.window.close();
    return;
  }

  // Open a Picture-in-Picture window.
  const pipWindow = await documentPictureInPicture.requestWindow({
    width: 640,
    height: 360,
  });

  // Copy all style sheets.
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");

      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.type = styleSheet.type;
      link.media = styleSheet.media;
      link.href = styleSheet.href;
      pipWindow.document.head.appendChild(link);
    }
  });

  // Move video to the Picture-in-Picture window and make it full page.
  const video = document.querySelector("#video");
  pipWindow.document.body.append(video);
  video.classList.toggle("fullpage", true);

  // Listen for the PiP closing event to move the video back.
  pipWindow.addEventListener("pagehide", (event) => {
    const videoContainer = document.querySelector("#videoContainer");
    const pipVideo = event.target.querySelector("#video");
    pipVideo.classList.toggle("fullpage", false);
    videoContainer.append(pipVideo);
  });
}

// Replace the built-in PiP button with our own button in the Video.js player.
window.onload = () => {
  const controls = videojs("video", { controls: true }).getChild("ControlBar");
  controls.removeChild("FullscreenToggle");
  controls.removeChild("PictureInPictureToggle");
  controls.addChild("button", {
    controlText: "Toggle Picture-in-Picture",
    className: "vjs-visible-text",
    clickHandler: togglePictureInPicture,
  });

  // Focusing opener is supported in Chrome 123 or later.
  const backToTabButton = controls.addChild("button", {
    controlText: "Back to tab",
    className: "vjs-visible-text vjs-hidden",
    clickHandler: () => {
      documentPictureInPicture.window.opener.focus();
    },
  });
  // Show back to tab button only in the PiP window.
  documentPictureInPicture.addEventListener("enter", () => {
    backToTabButton.show();
  });
};

/* Enter Picture-in-Picture (supported since Chrome 120) */

try {
  navigator.mediaSession.setActionHandler("enterpictureinpicture", function () {
    togglePictureInPicture();
  });
} catch (error) {
  console.log(
    'Warning! The "enterpictureinpicture" media session action is not supported.'
  );
}
