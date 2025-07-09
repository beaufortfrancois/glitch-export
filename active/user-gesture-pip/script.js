window.onload = async () => {
  const canvas = document.createElement("canvas");
  const video = document.createElement("video");
  canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
  video.muted = true;
  video.srcObject = canvas.captureStream(60 /* fps */);
  await video.play();

  document.onmouseleave = async () => {
    log("onmouseleave");
    if (!document.pictureInPictureElement)
      await video.requestPictureInPicture();
  };

  document.onmouseenter = async () => {
    log("onmouseenter");
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
  };

  window.onblur = async () => {
    log("onblur");
    if (!document.pictureInPictureElement)
      await video.requestPictureInPicture();
  };

  window.onfocus = async () => {
    log("onfocus");
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
  };

  window.onunhandledrejection = event => {
    log(event.reason);
    event.preventDefault();
  };

  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has("getUserMedia")) {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    log("navigator.mediaDevices.getUserMedia called with success");
  }
};

(function showUserActivation() {
  requestAnimationFrame(showUserActivation);
  userActivation.textContent = `isActive: ${navigator.userActivation.isActive} - hasBeenActive: ${navigator.userActivation.hasBeenActive}`;
})();

/* utils */

function log(string) {
  pre.append(`${string}\r\n\r\n`);
}
