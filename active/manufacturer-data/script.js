const filters = [
  {
    manufacturerData: [
      {
        // companyIdentifier: 0x00e0 /* Google */,
        //   dataPrefix: new Uint8Array([0x01, 0x02, 0x03, 0x04]),
        //   mask: new Uint8Array([0xff, 0xff, 0xff, 0xff])
        // },
        // {
        companyIdentifier: 0xffff,
        dataPrefix: new Uint8Array([0x01, 0x02]),
        mask: new Uint8Array([0xff, 0x01])
      }
    ]
  }
];

button.onclick = () => {
  pre.append(`${JSON.stringify(filters, 0, 2)}\r\n`);
  navigator.bluetooth.requestDevice({ filters }).catch(error => {
    if (error.name != "TypeError") return;
    let fallbackOptions = { acceptAllDevices: true };
    pre.append(`${JSON.stringify(fallbackOptions, 0, 2)}\r\n`);
    navigator.bluetooth.requestDevice(fallbackOptions);
  });
};

window.onerror = error => pre.append(error);
window.onunhandledrejection = event => pre.append(event.reason);
