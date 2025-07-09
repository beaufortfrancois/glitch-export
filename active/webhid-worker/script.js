function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

const worker = new Worker("worker.js");
worker.onmessage = ({ data }) => log(`[worker message] ${data}`);
worker.onerror = ({ message }) => log(`[worker error] ${message}`);

requestDeviceButton.onclick = async () => {
  const devices = await navigator.hid.requestDevice({ filters: [] });
  for (const device of devices) {
    log(`[window] Requested HID device "${device.productName}"`);
  }
};
