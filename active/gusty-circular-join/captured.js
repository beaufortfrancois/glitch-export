async function send(numberOfTimes) {
  let times = 0;

  while (times < numberOfTimes) {
    const config = {
      handle: crypto.randomUUID(),
      permittedOrigins: ["*"],
    };
    navigator.mediaDevices.setCaptureHandleConfig(config);
    logs.textContent = `${++times} times setCaptureHandleConfig has been called\r\n`;
    await new Promise((r) => setTimeout(r, 10));
  }
}
