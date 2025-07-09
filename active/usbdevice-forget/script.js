function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

if ("usb" in navigator) {
  navigator.usb.getDevices().then((connectedDevices) => {
    if (!connectedDevices.length) {
      log('No USB devices selected. Press the "request device" button.');
      return;
    }
    for (const connectedDevice of connectedDevices)
      log(`Got USB device "${connectedDevice.productName}`);
  });
  if (!("forget" in USBDevice.prototype))
    log(
      'Warning! Make sure you run Chromium 101 to get `USBDevice.forget()`.'
    );
} else {
  log("WebUSB is not available yet.");
}

requestDeviceButton.onclick = async (event) => {
  try {
    // Prompt user to select any USB device.
    const requestedDevice = await navigator.usb.requestDevice({ filters: [] });
    log(`Requested USB device "${requestedDevice.productName}`);
    requestedDevice.open();
    log(`Opened USB device "${requestedDevice.productName}`);
  } catch (error) {
    log(`${error}`);
  }
};

forgetDeviceButton.onclick = async (event) => {
  try {
    const [device] = await navigator.usb.getDevices();
    if (!device) {
      log("No device to forget. Request one first");
      return;
    }
    // Try forgetting the first device from getDevices().
    await device.forget();
    log(`Forgotten USB device "${device.productName}`);
  } catch (error) {
    log(`${error}`);
  }
};
