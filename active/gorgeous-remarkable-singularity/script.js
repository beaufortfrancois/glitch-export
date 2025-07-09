writeButton.addEventListener("click", async () => {
  const encoder = new TextEncoder();
  //   const aarRecord = {
  //     recordType: "android.com:pkg",
  //     data: encoder.encode("com.example.myapp")
  //   };

  //   const ndef = new NDEFReader();
  //   await ndef.write({ records: [aarRecord] });

  const ndef = new NDEFReader();
  try {
    const aarRecord = {
      recordType: "android.com:pkg",
      data: encoder.encode("de.rki.coronawarnapp")
    };

    await ndef.write({
      records: [aarRecord]
    });
    console.log("writeAppLog", "> App Message written");
  } catch {
    console.log("writeAppLog", "Argh! " + error);
  }
});
