(async _ => {
  try {
    await scanTags();
  } catch (error) {
    document.querySelector("pre").textContent = "Tap screen to allow Web NFC";
    document.body.addEventListener("click", scanTags, { once: true });
  }
})();

const tags = {
  "04:e1:4e:0a:bb:5d:80":
    "https://cdn.glitch.com/35e92bd5-f358-4ee8-a278-5e4058255aeb%2Fgingerbread-poly.glb?v=1581605447138", // https://poly.google.com/view/2MiCVschgHy
  "04:c6:3c:0a:bb:5d:80":
    "https://cdn.glitch.com/35e92bd5-f358-4ee8-a278-5e4058255aeb%2Favocado-poly.glb?v=1581604622714", // https://poly.google.com/view/1tgxGbXymi_
  "04:bb:48:0a:bb:5d:80":
    "https://cdn.glitch.com/35e92bd5-f358-4ee8-a278-5e4058255aeb%2Fdonut-2-poly.glb?v=1581605811661", // https://poly.google.com/view/6LSB0OZK8I7
  "04:a3:35:0a:bb:5d:80":
    "https://cdn.glitch.com/35e92bd5-f358-4ee8-a278-5e4058255aeb%2Flollipop-poly.glb?v=1581605542938" // https://poly.google.com/view/eIb0hlFvPtS
};

async function scanTags() {
  const reader = new NDEFReader();
  await reader.scan();
  document.querySelector("pre").textContent = "Waiting for NFC tags...";
  reader.onreading = ({ serialNumber }) => {
    const modelViewer = document.querySelector("model-viewer");
    modelViewer.setAttribute("src", tags[serialNumber]);
  };
}
