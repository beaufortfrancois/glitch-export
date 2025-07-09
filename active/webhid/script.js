let device;

let reader;
let readableStreamClosed;

let writer;
let writableStreamClosed;

console.log(`("hid" in navigator): ${"hid" in navigator}`);

navigator.hid.getDevices().then(devices => {
  if (devices.length == 0) {
    console.log("no devices");
    return;
  }
  device = devices[0];
  console.log(device);
});

requestDeviceButton.onclick = async event => {
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

    [device] = await navigator.hid.requestDevice({ filters: [] });
    console.log(device);
  } finally {
    document.body.style.display = "";
  }
};

openButton.onclick = async event => {
  await openDevice(device);
};

async function openDevice() {
  await device.open();
  device.oninputreport = onInputReport;
  device.addEventListener("inputreport", event => {
    const { data, device, reportId } = event;

    // We're only interested in this specific input report.
    if (device.productId != 0x2007 && reportId != 0x3f) return;

    const value = data.getUint8(0);
    const someKnownButtons = {
      1: "Button A",
      2: "Button X",
      4: "Button B",
      8: "Button Y"
    };
    console.log(`User pressed ${someKnownButtons[value]}`);
  });

  console.log(device);
}

function onInputReport({ data, device, reportId }) {
  console.debug({ data, device, reportId });
  log(data);

  if (device.productName.startsWith("Joy-Con")) {
    if (reportId == 0x21 && data.getUint8(13) == 0x50) {
      // https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering/blob/master/bluetooth_hid_subcommands_notes.md#subcommand-0x50-get-regulated-voltage
      const voltage = data.getUint16(14, /*littleEndian=*/ true);
      console.log(`Joy-Con voltage: ${voltage * 2.5}mV`);
    }
    if (reportId == 0x3f) {
      switch (data.getUint8(0)) {
        case 0x00:
          // No key is pressed
          break;
        case 0x01:
          console.log("A pressed");
          break;
        case 0x02:
          console.log("X pressed");
          break;
        case 0x04:
          console.log("B pressed");
          break;
        case 0x08:
          console.log("Y pressed");
          break;
        case 0x10:
          console.log("SL pressed");
          break;
        case 0x20:
          console.log("SR pressed");
          break;
        default:
          console.log("Unknown key pressed");
          break;
      }
    }
  }
}

sendReportButton.onclick = async event => {
  const reportId = parseInt(reportIdInput.value);
  const data = Uint8Array.from(reportDataInput.value.split(","));
  try {
    await device.sendReport(reportId, data);
  } catch (error) {
    console.error("device.sendReport failed:", error);
  }
};

sendFeatureReportButton.onclick = async event => {
  const reportId = parseInt(featureReportIdInput.value);
  const data = Uint32Array.from(featureReportDataInput.value.split(","));
  try {
    await device.sendFeatureReport(reportId, data);
  } catch (error) {
    console.error("device.sendFeatureReport failed:", error);
  }
};

closeButton.onclick = async event => {
  await device.close();
  console.log("await device.close()");
};

navigator.hid.addEventListener("connect", async event => {
  console.log(event);
  device = event.device;
  await openDevice();
});

navigator.hid.addEventListener("disconnect", event => {
  console.log(event);
});

/* utils */

function log(data) {
  const hexString = [...new Uint8Array(data.buffer)]
    .map(b => {
      return b.toString(16).padStart(2, "0");
    })
    .join(" ");
  console.debug(`Data: ` + hexString);
}

const waitFor = duration => new Promise(r => setTimeout(r, duration));

/* fun */

async function blink() {
  // Pick Keyboard Backlight if available.
  const [device] = await navigator.hid.requestDevice({
    filters: [{ vendorId: 0x05ac, usage: 0x0f, usagePage: 0xff00 }]
  });
  await device.open();
  // Enjoy!
  for (let i = 0; i < 10; i++) {
    await device.sendFeatureReport(1, Uint32Array.from([0, 0]));
    await waitFor(100);
    await device.sendFeatureReport(1, Uint32Array.from([512, 0]));
    await waitFor(100);
  }
}

let deviceCounter = 0;

async function setVibration() {
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
}
