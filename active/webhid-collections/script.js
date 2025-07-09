console.log = (first, second = "") => {
  log.innerHTML += `<b>${first}</b> ${second}\r\n`;
};

function intToHex(dec) {
  return (
    "0x" +
    (dec + 0x10000)
      .toString(16)
      .substr(-4)
      .toUpperCase()
  );
}

if (!("hid" in navigator)) {
  console.log("WebHID is not available yet.");
}

navigator.hid.getDevices().then(connectedDevices => {
  if (!connectedDevices.length) {
    console.log(
      "No HID devices selected.",
      'Press the "request device" button.'
    );
    return;
  }
  log.textContent = "";
  devices = connectedDevices;
  for (const device of devices) {
    showDeviceCollections(device);
  }
});

requestDeviceButton.onclick = async event => {
  document.body.style.display = "none";

  try {
    // Prompt user to select any HID device.
    devices = await navigator.hid.requestDevice({ filters: [] });
    log.textContent = "";
    for (const device of devices) {
      showDeviceCollections(device);
    }
  } finally {
    document.body.style.display = "";
  }
};

function showDeviceCollections(device) {
  console.log("Product name:", device.productName);
  console.log("USB Vendor ID:", intToHex(device.vendorId));
  console.log("USB Product ID:", intToHex(device.productId));
  console.log("");

  if ("HIDCollectionInfo" in window) {
    showCollections(device.collections, "");
  } else {
    console.log("Collections:", JSON.stringify(device.collections, null, 2));
  }
  console.log("");
}

function showCollections(collections, indent) {
  for (let collection of collections) {
    console.log(
      indent + "> Usage:",
      `${collection.usage} (${intToHex(collection.usage)})`
    );
    console.log(
      indent + "> Usage page:",
      `${collection.usagePage} (${intToHex(collection.usagePage)})`
    );
    if (collection.inputReports.length)
      console.log(indent + "> Input reports:", collection.inputReports);
    if (collection.outputReports.length)
      console.log(indent + "> Output reports:", collection.outputReports);
    if (collection.featureReports.length)
      console.log(indent + "> Feature reports:", collection.featureReports);
    if (collection.children.length) {
      console.log(indent + "> Sub collections:");
      console.log("");
      showCollections(collection.children, indent + "  ");
    }
    console.log("");
  }
}
