function log(text) {
  logs.innerHTML += `${text}\r\n`;
}

if ("bluetooth" in navigator) {
  if (!("getDevices" in navigator.bluetooth)) {
    log(
      'Warning! Make sure you enable "chrome://flags/#enable-web-bluetooth-new-permissions-backend" to get navigator.bluetooth.getDevices().'
    );
    
  } else {
    navigator.bluetooth.getDevices().then((connectedDevices) => {
      if (!connectedDevices.length) {
        log('No Bluetooth devices selected. Press the "request device" button.');
        return;
      }
      for (const connectedDevice of connectedDevices)
        log(`Got Bluetooth device "${connectedDevice.productName}`);
    });
  }
  if (!("forget" in BluetoothDevice.prototype))
    log(
      'Warning! Make sure you enable "chrome://flags/#enable-web-bluetooth-new-permissions-backend" to get BluetoothDevice.forget().'
    );
} else {
  log("Web Bluetooth is not available yet.");
}

requestDeviceButton.onclick = async (event) => {
  try {
    // Prompt user to select any Bluetooth device.
    const requestedDevice = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
    log(`Requested Bluetooth device "${requestedDevice.productName}`);
  } catch (error) {
    log(`${error}`);
  }
};

forgetDeviceButton.onclick = async (event) => {
  try {
    const [device] = await navigator.bluetooth.getDevices();
    if (!device) {
      log("No device to forget. Request one first");
      return;
    }
    // Try forgetting the first device from getDevices().
    await device.forget();
    log(`Forgotten Bluetooth device "${device.productName}`);
  } catch (error) {
    log(`${error}`);
  }
};
