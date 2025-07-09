const reader = new NDEFReader();
reader.scan({ recordType: "example.com:shoppingItem" });
reader.onreading = event => {
  const shoppingItemRecord = event.message.records[0];
  if (!shoppingItemRecord) {
    return;
  }

  const [nameRecord, descriptionRecord] = shoppingItemRecord.toRecords();

  const decoder = new TextDecoder();
  console.log("Item name: " + decoder.decode(nameRecord.data));
  console.log("Item description: " + decoder.decode(descriptionRecord.data));
};


const encoder = new TextEncoder();
const writer = new NDEFWriter();
writer.push({
  records: [
    {
      recordType: "example.com:shoppingItem", // External record
      data: {
        records: [
          {
            recordType: "unknown", // Shopping item name
            data: encoder.encode("Food")
          },
          {
            recordType: "unknown", // Shopping item description
            data: encoder.encode("Provide nutritional support for an organism.")
          }
        ]
      }
    }
  ]
});

// actually I guess that unknown records could be useful inside external records
// as its your record, so you know what it represents and can avoid storing the mime type\
