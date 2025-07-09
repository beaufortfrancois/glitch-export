console.log = text => {
  log.textContent += `${text}\r\n`;
};

const waitFor = duration => new Promise(r => setTimeout(r, duration));

let device;

if (!("hid" in navigator)) {
  console.log("WebHID is not available yet.");
}

navigator.hid.getDevices().then(devices => {
  if (devices.length == 0) {
    console.log(`No HID devices selected. Press the "request device" button.`);
    return;
  }
  device = devices[0];
  console.log(`User previously selected "${device.productName}" HID device.`);
  console.log(`Now press "open device" button to be able to send reports.`);
});

requestDeviceButton.onclick = async event => {
  if (window.self !== window.top) {
    window.open(location.href, "", "noopener,noreferrer");
    return;
  }
  document.body.style.display = "none";

  try {
    // Prompt user to select an Apple Keyboard Backlight device.
    [device] = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x05ac, usage: 0x0f, usagePage: 0xff00 }]
    });
    if (!device) return;

    console.log(`User selected "${device.productName}" HID device.`);
    console.log(`Now press "open device" button to be able to send reports.`);
  } finally {
    document.body.style.display = "";
  }
};

openButton.onclick = async event => {
  if (!device) return;

  await device.open();
  console.log(`Waiting for user to press "blink" button...`);
};

blinkButton.onclick = async event => {
  if (!device) return;

  const reportId = 1;
  for (let i = 0; i < 10; i++) {
    // Turn off
    await device.sendFeatureReport(reportId, Uint32Array.from([0, 0]));
    await waitFor(100);
    // Turn on
    await device.sendFeatureReport(reportId, Uint32Array.from([512, 0]));
    await waitFor(100);
    console.log(`The "${device.productName}" HID device is blinking...`);
  }
};
