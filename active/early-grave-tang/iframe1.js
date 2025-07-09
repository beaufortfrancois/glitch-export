CropTarget.fromElement(cropArea).then((cropTarget) => {
  window.parent.postMessage(cropTarget);
  const logs = window.parent.document.querySelector("#logs");
  logs.textContent += `[iframe1] Calling CropTarget.fromElement(cropArea);\r\n`;
});
