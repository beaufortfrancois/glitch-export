async function writeToNfcTag() {
  const writer = new NFCWriter();
  const records = [
    {
      recordType: "text",
      data: "hello"
    },
    {
      recordType: "url",
      data: "https://google.com"
    },
    {
      recordType: "opaque", // JSON MIME type
      mediaType: "application/json",
      data: { key1: "value1", key2: "value2" }
    },
    {
      recordType: "opaque", // Image MIME type
      mediaType: "image/png",
      data: await (await fetch("image.png")).arrayBuffer()
    },
    {
      recordType: "android.com:pkg", // Known external type
      data: new TextEncoder().encode("org.chromium.webapk.ace0b15a6ce931426")
        .buffer
    },
    {
      recordType: "example.com:a", // Custom external type
      data: Uint8Array.of(1)
    }
  ];

  return writer.push({ records });
}

function readNfcTag() {
  const reader = new NFCReader();
  reader.scan();
  reader.onreading = ({ message }) => {
    // UTF-16 handling for free if needed.
    const decoder = new TextDecoder();

    for (const record of message.records) {
      const data = record.data; // DataView like in Web Bluetooth, WebUSB, WebHID
      switch (record.recordType) {
        case "text":
          console.log(`Text: ${decoder.decode(data)}`);
          break;
        case "url":
          console.log(`URL: ${decoder.decode(data)}`);
          break;
        case "opaque":
          // Let developer handle opaque case
          if (record.mediaType === "application/json") {
            console.log(`JSON: ${JSON.parse(decoder.decode(data))}`);
          } else if (record.mediaType.startsWith("image/")) {
            const blob = new Blob([data], {
              type: record.mediaType
            });
            const img = document.createElement("img");
            img.src = URL.createObjectURL(blob);
            document.body.appendChild(img);
          } else {
            console.log(`Opaque: Not handled`);
          }
          break;
        case "android.com:pkg":
          console.log(`AAR Package Name: ${decoder.decode(data)}`);
          break;
        case "example.com:a":
          console.log(`My custom external type: ${data.getUint8(0)}`);
          break;
      }
    }
  };
}

```idl
[Exposed=Window]
interface NDEFRecord {
  constructor(NDEFRecordInit recordInit);

  readonly attribute NDEFRecordType recordType;
  readonly attribute USVString mediaType;
  readonly attribute USVString id;
  readonly attribute DataView? data;

  sequence<NDEFRecord> toRecords();
};

dictionary NDEFRecordInit {
  NDEFRecordType recordType;
  USVString mediaType;
  USVString id;

  any data;
};
```;
