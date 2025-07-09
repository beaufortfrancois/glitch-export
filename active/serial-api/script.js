let port;

let reader;
let readableStreamClosed;

let writer;
let writableStreamClosed;

console.log(`("serial" in navigator): ${"serial" in navigator}`);

navigator.serial.getPorts().then(async ports => {
  if (ports.length == 0) {
    console.log("no serial ports");
    return;
  }
  port = ports[0];
  console.log(port);
});

requestPortButton.onclick = async event => {
  document.body.style.display = "none";
  try {
    port = await navigator.serial.requestPort({
      // filters: [{ usbVendorId: 0x0d28, usbProductId: 0x0204 }]
    });
    console.log(port);
  } finally {
    document.body.style.display = "";
  }
};

openPortButton.onclick = async event => {
  await port.open({ baudRate: 9600 });
  console.log(port);
};

getInfoButton.onclick = async event => {
  console.log(port.getInfo());
};

readButton.onclick = async event => {
  // reader = port.readable.getReader();

  const textDecoder = new TextDecoderStream();
  readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  // textReader = textDecoder.readable.getReader();
  reader = textDecoder.readable
    .pipeThrough(new TransformStream(new LineBreakTransformer()))
    .getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      reader.releaseLock();
      break;
    }
    if (value) {
      console.log(value);
    }
  }
};

writeButton.onclick = async event => {
  // writer = port.writable.getWriter();
  // const data = new Uint8Array([116, 114, 117, 101, 10]); // "true\n"
  // await writer.write(data);
  // writer.releaseLock();

  if (!writer) {
    const textEncoder = new TextEncoderStream();
    writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

    writer = textEncoder.writable.getWriter();
  }
  await writer.write(text.value + "\n");
};

turnOnBrkSignalButton.onclick = () => setSignals({ break: true });
turnOnDtrSignalButton.onclick = () => setSignals({ dataTerminalReady: true });
turnOnRtsSignalButton.onclick = () => setSignals({ requestToSend: true });
turnOffBrkSignalButton.onclick = () => setSignals({ break: false });
turnOffDtrSignalButton.onclick = () => setSignals({ dataTerminalReady: false });
turnOffRtsSignalButton.onclick = () => setSignals({ requestToSend: false });

async function setSignals(signals) {
  console.log(signals);
  await port.setSignals(signals);
}

getSignalsButton.onclick = async event => {
  const signals = await port.getSignals();
  console.log(`Clear To Send: ${signals.clearToSend}`);
  console.log(`Data Carrier Detect: ${signals.dataCarrierDetect}`);
  console.log(`Data Set Ready: ${signals.dataSetReady}`);
  console.log(`Ring Indicator: ${signals.ringIndicator}`);
};

closeButton.onclick = async event => {
  // // With no transform streams but still with a loop
  // await reader.cancel();
  // console.log("await reader.cancel()");

  try {
    // With transform streams.
    reader.cancel().catch(error => console.log(error));
    await readableStreamClosed.catch(() => {});
    console.log("await readableStreamClosed");

    writer.close();
    await writableStreamClosed;
    console.log("await writableStreamClosed");
  } catch (error) {
    console.log(error);
  } finally {
    await port.close();
    console.log("await port.close()");
  }
};

navigator.serial.addEventListener("connect", async event => {
  console.log(event);
  port = event.port;
  await port.open({ baudrate: 9600 });
  console.log(port);
});

navigator.serial.addEventListener("disconnect", event => {
  console.log(event);
});

class LineBreakTransformer {
  constructor() {
    // A container for holding stream data g stream data until a new line.
    this.chunks = "";
  }

  transform(chunk, controller) {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    lines.forEach(line => controller.enqueue(line));
    console.debug(
      `[LineBreakTransformer/transform] this.chunks: ${this.chunks}`
    );
  }

  flush(controller) {
    console.log("flush", this.chunks);
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}
