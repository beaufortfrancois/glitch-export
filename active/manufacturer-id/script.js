button.onclick = () => {
  navigator.bluetooth.requestDevice({
    filters: [{ manufacturerId: 0x00e0 /* Google */ }]
  });
};

window.onerror = error => pre.append(error);
window.onunhandledrejection = event => pre.append(event.reason);
