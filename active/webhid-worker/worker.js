navigator.hid.getDevices().then((devices) => {
  for (const device of devices) {
    postMessage(`Got HID device "${device.productName}"`);
  }
});

navigator.hid.onconnect = ({device}) => {
  postMessage(`Connected HID device "${device.productName}"`);
};
navigator.hid.ondisconnect = ({device}) => {
  postMessage(`Disonnected HID device "${device.productName}"`);
};
