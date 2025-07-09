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
  console.log(`Now press "open device" button to receive input reports.`);
});

requestDeviceButton.onclick = async event => {
  // if (window.self !== window.top) {
  //   window.open(location.href, "", "noopener,noreferrer");
  //   return;
  // }
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
    console.log(`Now press "open device" button to receive input reports.`);
  } finally {
    document.body.style.display = "";
  }
};

openButton.onclick = async event => {
  if (!device) return;

  await device.open();
  console.log(`Waiting for user to press button...`);

  device.addEventListener("inputreport", event => {
    const { data, device, reportId } = event;

    // Handle only the Joy-Con Right device and a specific report ID.
    if (device.productId != 0x2007 && reportId != 0x3f) return;

    const value = data.getUint8(0);
    if (value == 0) return;

    const someButtons = { 1: "A", 2: "X", 4: "B", 8: "Y" };
    console.log(`User pressed button ${someButtons[value]}.`);
  });
};
