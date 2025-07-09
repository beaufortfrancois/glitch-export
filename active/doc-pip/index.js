button1.onclick = async () => {
  await documentPictureInPicture.requestWindow();
  log("Success!");
};

button2.onclick = async () => {
  await documentPictureInPicture.window.documentPictureInPicture.requestWindow();
  log("Success!");
};

setInterval(() => {
  if (window.documentPictureInPicture?.window) {
    documentPictureInPicture.window.document.body.textContent = `navigator.userActivation.isActive = ${documentPictureInPicture.window.navigator.userActivation.isActive}`;
  }
}, 1000);
/* Utils */

function log(text) {
  logs.textContent += `${text}\r\n`;
}
