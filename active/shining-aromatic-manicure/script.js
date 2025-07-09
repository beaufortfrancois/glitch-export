button.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  stream.getTracks().forEach((track) => track.stop());
  const devices = await navigator.mediaDevices.enumerateDevices();
  pre = document.createElement("pre");
  pre.innerHTML = devices
    .filter((device) => device.deviceId !== "default")
    .map((device) => `${device.deviceId} - ${device.label}`)
    .join("<br>");
  document.body.append(pre);
};
