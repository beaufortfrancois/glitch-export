function setNdefTextRecord() {
  const MB = 128;
  const ME = 64;
  const CF = 32;
  const SR = 16;
  const IL = 8;
  
  const headerByte = MB + ME + 0x01 /* Well-known type record */;

  const payloadTypeFieldByte = 0x54; // NDEF payload type for the Text record. 
  const statusByte = 0x02; // This is UTF-8, and has a two-byte language code.
  const langBytes = [101, 110]; // 'en' encoded in UTF-8
  const textBytes = [104, 101, 108, 108, 111]; // 'hello' encoded in UTF-8
  const payloadLength = 1 + langBytes.length + textBytes.length;
  
  const payload = new ArrayBuffer(8 + langBytes.length + textBytes.length);
  new Uint8Array(payload).set([
    headerByte,
    1, // NDEF payload type length
    0, // ID length
    0, // TYPE
    0, // ID
    payloadLength,
    payloadTypeFieldByte,
    statusByte]);
  new Uint8Array(payload).set(langBytes, 8);
  new Uint8Array(payload).set(textBytes, 10);

  NRF.nfcRaw(payload);
}


NRF.on('NFCon', function() {
  console.log('NFCon');
});


NRF.on('NFCoff', function() {
  console.log('NFCoff');
});


setNdefTextRecord();
//NRF.nfcURL("http://espruino.com");