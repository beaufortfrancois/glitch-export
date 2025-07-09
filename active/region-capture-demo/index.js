const iframe = document.querySelector("iframe");
const innerCropArea = document.querySelector("#innerCropArea");

iframe.onload = async () => {
  const cropTarget = await CropTarget.fromElement(innerCropArea);
  iframe.contentWindow.postMessage(cropTarget);
};
