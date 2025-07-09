async function maybeMute() {
  const [device] = await navigator.hid.getDevices();
  if (!device) return;

  await device.open();
  device.oninputreport = oninputreport;
  log(`Opened "${device.productName}"`);

  if (awaitCheckbox.checked) {
    log(`Waiting 2 seconds...`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (ledOffHookCheckbox.checked) {
    log(`Turning on "LED off hook"...`);
    await device.sendReport(0x17, Uint8Array.from([1]));
    log(`-> reportId: 0x17, data: 01 (LED off hook)`);
  }

  if (ledMuteCheckbox.checked) {
    log(`Turning on "LED mute usage"...`);
    await device.sendReport(0x09, Uint8Array.from([1]));
    log(`-> reportId: 0x09, data: 01 (LED mute usage)`);
  }
}

requestDeviceButton.onclick = async (event) => {
  await navigator.hid.requestDevice({ filters: [] });
  await maybeMute();
  log(`Unplug the device and plug it back in`);
};

navigator.hid.onconnect = ({ device }) => {
  log(`Connected "${device.productName}"`);
  maybeMute();
};

navigator.hid.ondisconnect = ({ device }) => {
  log(`Disconnected "${device.productName}"\r\n`);
};

window.onload = maybeMute;

/* Utils */

function oninputreport({ data, reportId }) {
  const hexString = [...new Uint8Array(data.buffer)]
    .map((b) => {
      return b.toString(16).padStart(2, "0");
    })
    .join(" ");
  const hexReportId = reportId.toString(16).padStart(2, "0");
  log(`<- reportId: 0x${hexReportId}, data: ${hexString}`);
}

function log(text) {
  logs.innerHTML += `${text}<br/>`;
}
