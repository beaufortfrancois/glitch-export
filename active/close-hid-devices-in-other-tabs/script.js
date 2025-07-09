function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

// Store devices to avoid GC.
let devices = [];

navigator.hid.getDevices().then((connectedDevices) => {
  connectedDevices.forEach((device) => openDevice(device));
});

requestDeviceButton.onclick = async (event) => {
  const [device] = await navigator.hid.requestDevice({ filters: [] });
  openDevice(device);
};

async function openDevice(device) {
  log(`Opening HID device "${device.productName}"...`);
  const deviceInfo = {
    vendorId: device.vendorId,
    productId: device.productId,
    productName: device.productName,
  };
  await device.open();
  broadcastChannel.postMessage(JSON.stringify(deviceInfo));
  devices.push(device);
  log(`> Opened HID device "${device.productName}".`);
}

const broadcastChannel = new BroadcastChannel("devicesToClose");
broadcastChannel.onmessage = async (event) => {
  log("Received message to close an HID device...");
  const deviceInfo = JSON.parse(event.data);
  const devices = await navigator.hid.getDevices();
  const devicesToClose = devices.filter(
    (device) =>
      device.opened &&
      device.vendorId == deviceInfo.vendorId &&
      device.productId == deviceInfo.productId &&
      device.productName == deviceInfo.productName
  );
  devicesToClose.forEach(async (device) => {
    await device.close();
    log(`> Closed HID device "${deviceInfo.productName}"...`);
  });
};
