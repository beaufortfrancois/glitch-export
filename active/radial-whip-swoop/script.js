let device;

navigator.hid.getDevices().then(async (devices) => {
  if (devices.length == 0) return;
  device = devices[0];
  console.log(device);
});

requestDeviceButton.onclick = async (event) => {
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [
        {
          vendorId: 0x047d,
          productId: 0x2012,
          usagePage: 0xff02,
        },
      ],
    });
    if (devices.length == 0) return;
    device = devices[0];
    console.log(device);
  } catch (error) {
    console.log(error);
  }
};

receiveFeatureReportButton.onclick = async (event) => {
  try {
    if (!device.opened) await device.open();
    const data = await device.receiveFeatureReport(0);
    logDataView("<-", data);
  } catch (error) {
    console.log(error);
  }
};

sendFeatureReportButton.onclick = async (event) => {
  try {
    if (!device.opened) await device.open();
    const bytes = Uint8Array.from(JSON.parse(bytesInput.value));
    await device.sendFeatureReport(0, bytes);
    logDataView("->", bytes);
    const data = await device.receiveFeatureReport(0);
    logDataView("<-", data);
  } catch (error) {
    console.log(error);
  }
};

document.onkeydown =
  document.onkeyup =
  document.onkeypress =
    function (event) {
      logs.innerHTML += `on${event.type}: ${event.code}<br/>`;
    };

/* Utils */

const logDataView = (text, valueDataView) => {
  const hexString = [...new Uint8Array(valueDataView.buffer)]
    .map((b) => {
      return b.toString(16).padStart(2, "0");
    })
    .join(" ")
    .toUpperCase();
  console.log(`${text} ${hexString}`);
  logs.innerHTML += `${text} ${hexString}<br/>`;
  // console.log(valueDataView);
};
