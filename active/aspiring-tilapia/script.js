// setTimeout(_ => {
//   const r = new NDEFReader();
//   r.scan().catch(e => console.log({e}));
// }, 2000);

/* Permissions tracking */
navigator.permissions.query({ name: "nfc" }).then((permissionStatus) => {
  log(`NFC user permission: ${permissionStatus.state}`);
  permissionStatus.onchange = (_) => {
    log(`NFC user permission changed: ${permissionStatus.state}`);
  };
});

// setTimeout(async _ => {
//   try {
//     const writer = new NDEFWriter();
//     log("writing...");
//     await writer.write("lol");
//     log("written");
//   } catch (error) {
//     log(error);
//   }
// }, 2000);

/* Read */

soundInput.checked = new URL(location).searchParams.has("sound");

function playSound() {
  if (!soundInput.checked) {
    return;
  }
  const audio = document.createElement("audio");
  audio.src = "https://airhorner.com/sounds/airhorn.mp3";
  audio.currentTime = 0;
  audio.play();
}

const abortController = new AbortController();
abortController.signal.addEventListener("abort", (_) => {
  log("> Aborted");
});

abortButton.addEventListener("click", (_) => {
  abortController.abort("abort button clicked");
});

scanButton.addEventListener("click", async (_) => {
  log("Scanning...");
  try {
    if (signalInput.checked) {
      await r.scan({ signal: abortController.signal });
    } else {
      await r.scan();
    }
    log("> Scan started");
  } catch (error) {
    log(`[Scan failed] ${error}`);
    console.log({ error });
  }
});

const r = new NDEFReader();

r.onreadingerror = (error) => {
  log(`Argh! ${error.message}`);
};

r.onerror = (error) => {
  log(`Argh! ${error.message}`);
};

r.onreading = ({ message, serialNumber }) => {
  playSound();
  log(`> Serial Number: ${serialNumber}`);
  log(`> Records: (${message.records.length})`);

  logMessage(message);
};

function logMessage(message) {
  if (message.records.length === 0) {
    log(`  > No Web NFC records`);
    return;
  }

  for (const record of message.records) {
    console.log(record);
    log(`  > recordType: ${record.recordType}`);
    log(`  > mediaType: ${record.mediaType}`);
    log(`  > id: ${record.id}`);
    log(`  > lang: ${record.lang}`);
    log(`  > encoding: ${record.encoding}`);

    const decoder = new TextDecoder();
    switch (record.recordType) {
      case "text":
        const textDecoder = new TextDecoder(record.encoding);
        log(
          `  > data: ${textDecoder.decode(record.data).replace(/[\r\n]/g, "")}`
        );
        break;
      case "url":
      case "absolute-url":
      case "android.com:pkg": // external
        log(`  > data: ${decoder.decode(record.data)}`);
        break;
      case "mime":
        if (record.mediaType === "application/json") {
          log(`  > data: ${decoder.decode(record.data)}`);
        } else if (record.mediaType.startsWith("image/")) {
          const img = document.createElement("img");
          const blob = new Blob([record.data], { type: record.mediaType });
          img.src = URL.createObjectURL(blob);
          document.body.appendChild(img);
        } else {
          log(`  > data: Mime record not handled`);
        }
        break;
      default:
        let a = [];
        for (let i = 0; i < record.data.byteLength; i++) {
          a.push(
            "0x" + ("00" + record.data.getUint8(i).toString(16)).slice(-2)
          );
        }
        log(`  > data(${record.data.byteLength}): ${a.join(" ")}`);
    }
    try {
      log(`  > toRecords(): ${record.toRecords()}`);
    } catch (e) {
      log(`  > toRecords(): ${e}`);
    }
    log(`  - - - - - - - - - - - - - -`);
  }
}

/* Write */

let w;
if ("NDEFWriter" in window) {
  w = new NDEFWriter();
} else {
  w = new NDEFReader();
}

writeButton.addEventListener("click", async (_) => {
  // return await w.write({
  //   records: [
  //     // { recordType: "text", data: "KIKOU" },
  //     { recordType: "url", data: "https://mobile.twitter.com?from-web-nfc" }
  //   ]
  // });
  const response = await fetch(
    "https://cdn.glitch.com/ffe1cfdc-67cb-4f9a-8380-6e9b1b69778d%2Fred.png"
  );
  const opaqueArrayBuffer = await response.arrayBuffer();
  const opaqueMediaType = response.headers.get("content-type");

  const textEncoder = new TextEncoder();
  let records = [
    // {
    //   recordType: "empty"
    // },
    // {
    //   id: "1",
    //   recordType: "text",
    //   lang: "fr",
    //   encoding: "utf-16",
    //   data: a2utf16("Bonjour, François !"),
    // },
    {
      id: "2",
      recordType: "url",
      data: "https://url.com"
    },
    // {
    //   id: "3",
    //   recordType: "mime",
    //   mediaType: "application/json",
    //   data: textEncoder.encode(
    //     JSON.stringify({ key1: "value1", key2: "value2" })
    //   )
    // },
    // {
    //   id: "4",
    //   recordType: "mime",
    //   mediaType: opaqueMediaType,
    //   data: opaqueArrayBuffer
    // },
    // {
    //   id: "5",
    //   recordType: "android.com:pkg",
    //   data: textEncoder.encode("org.chromium.webapk.ace0b15a6ce931426").buffer // Remove buffer when external is not just arrayBuffer
    // },
    // {
    //   id: "6",
    //   recordType: "absolute-url",
    //   data: "https://absolute-url.com"
    // },
    // {
    //   id: "7",
    //   recordType: "unknown",
    //   data: textEncoder.encode("hello")
    // },
    // {
    //   id: "8",
    //   recordType: "smart-poster",
    //   data: {
    //     records: [
    //       {
    //         recordType: "url", // URL record for the Sp content
    //         data: "https://my.org/content/19911",
    //       },
    //       {
    //         recordType: "text", // title record for the Sp content
    //         data: "Funny dance",
    //       },
    //       {
    //         recordType: ":t", // type record, a local type to Sp
    //         data: textEncoder.encode("image/gif"), // MIME type of the Sp content
    //       },
    //       {
    //         recordType: ":s", // size record, a local type to Sp
    //         data: new Uint32Array([4096]), // byte size of Sp content
    //       },
    //       {
    //         recordType: ":act", // action record, a local type to Sp
    //         // do the action, in this case open in the browser
    //         data: new Uint8Array([0]),
    //       },
    //       {
    //         recordType: "mime", // icon record, a MIME type record
    //         mediaType: opaqueMediaType,
    //         data: opaqueArrayBuffer,
    //       },
    //     ],
    //   },
    // },
  ];

  // records = [
  //   {
  //     recordType: "url",
  //     data: "https://my.yubico.com/neo/ccccccegjevjekctcgifduchggructhnirtdujguhitb"
  //   }
  // ];

  log("Writing...");
  try {
    let message;
    const records = `${now()}`;
    if (signalInput.checked) {
      message = await w.write(records, { signal: abortController.signal });
    } else {
      message = await w.write(records);
    }
    log("> Written");
    if (message) {
      log("> And read");
      logMessage(message);
    }
  } catch (error) {
    log(`[Write failed] ${error}`);
  }
});


/* Utils */

function now() {
  return Intl.DateTimeFormat("en", { timeStyle: "long" }).format(new Date());
}

function log(string) {
  document.querySelector("pre").textContent += `${string}\n`;
}

function a2utf16(string) {
  let result = new Uint16Array(string.length);
  for (let i = 0; i < string.length; i++) {
    result[i] = string.codePointAt(i);
  }
  return result;
}
