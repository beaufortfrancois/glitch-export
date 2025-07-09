let device;

navigator.hid.getDevices().then(async (devices) => {
  if (devices.length == 0) return;
  device = devices[0];
  listenToInputReports(device);
  console.log(device);
});

requestDeviceButton.onclick = async (event) => {
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [
        {
          usagePage: 0x0c, // Consumer Devices
        },
      ],
    });
    if (devices.length == 0) return;
    device = devices[0];
  listenToInputReports(device);
    console.log(device);
  } catch (error) {
    console.log(error);
  }
};

function listenToInputReports(device) {
  device.oninputreport = (event) => {
    const { data, device, reportId } = event;
    logDataView("<-", data);
  };  
}

sendReportButton.onclick = async (event) => {
  try {
    if (!device.opened) await device.open();
    const bytes = Uint8Array.from(JSON.parse(bytesInput.value));
    await device.sendReport(1, bytes);
    logDataView("->", bytes);
    // logDataView("<-", data);
  } catch (error) {
    console.log(error);
  logs.innerHTML += `${error}<br/>`;
  }
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
