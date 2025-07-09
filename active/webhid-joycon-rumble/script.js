console.log = text => {
  log.textContent += `${text}\r\n`;
};

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
    const filters = [
      {
        vendorId: 0x057e, // Nintendo Co., Ltd
        productId: 0x2006 // Joy-Con L
      },
      {
        vendorId: 0x057e, // Nintendo Co., Ltd
        productId: 0x2007 // Joy-Con R
      }
    ];

    [device] = await navigator.hid.requestDevice({ filters });
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
  console.log(`Waiting for user to press "rumble" button...`);
};

let deviceCounter = 0;

rumbleButton.onclick = async event => {
  if (!device) return;

  // Enable vibration
  const enableVibrationData = [1, 0, 1, 64, 64, 0, 1, 64, 64, 0x48, 0x01];
  await device.sendReport(0x01, new Uint8Array(enableVibrationData));

  // Strong rumble (141 Hz), max amplitude.
  const hf = 0x0098;
  const lf = 0x46;
  const hfa = 0x1e;
  const lfa = 0x8047;
  const lhf = hf;
  const llf = lf;
  const lhfa = hfa;
  const llfa = lfa;
  const rhf = hf;
  const rlf = lf;
  const rhfa = hfa;
  const rlfa = lfa;
  const rumbleData = [
    deviceCounter++ & 0xff,
    lhf & 0xff,
    lhfa + ((lhf >>> 8) & 0xff),
    llf + ((llfa >>> 8) & 0xff),
    llfa & 0xff,
    rhf & 0xff,
    rhfa + ((rhf >>> 8) & 0xff),
    rlf + ((rlfa >>> 8) & 0xff),
    rlfa & 0xff
  ];
  await device.sendReport(0x10, new Uint8Array(rumbleData));

  console.log(`The "${device.productName}" HID device is rumbling...`);
};
