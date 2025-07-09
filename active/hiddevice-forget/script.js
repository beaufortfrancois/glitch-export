function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

if ("hid" in navigator) {
  navigator.hid.getDevices().then((connectedDevices) => {
    if (!connectedDevices.length) {
      log('No HID devices selected. Press the "request device" button.');
      return;
    }
    for (const connectedDevice of connectedDevices)
      log(`Got HID device "${connectedDevice.productName}`);
  });
  if (!("forget" in HIDDevice.prototype))
    log(
      'Warning! Make sure you run Chromium 99.0.4813.0 and the "Experimental Web Platform Features" flag is enabled to get `HIDDevice.forget()`.'
    );
} else {
  log("WebHID is not available yet.");
}

requestDeviceButton.onclick = async (event) => {
  try {
    // Prompt user to select any HID device.
    const requestedDevices = await navigator.hid.requestDevice({ filters: [] });
    for (const requestedDevice of requestedDevices) {
      log(`Requested HID device "${requestedDevice.productName}`);
    }
  } catch (error) {
    log(`${error}`);
  }
};

forgetDeviceButton.onclick = async (event) => {
  try {
    const [device] = await navigator.hid.getDevices();
    if (!device) {
      log("No device to forget. Request one first");
      return;
    }
    // Try forgetting the first device from getDevices().
    await device.forget();
    log(`Forgotten HID device "${device.productName}`);
  } catch (error) {
    log(`${error}`);
  }
};
