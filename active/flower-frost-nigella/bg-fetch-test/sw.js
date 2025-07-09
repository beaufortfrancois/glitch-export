addEventListener("backgroundfetchsuccess", async (event) => {
  console.log('sw', event.registration);
  
  const records = await event.registration.matchAll();
  
  for (const record of records) {
    const response = await record.responseReady;
    console.log(await response.text());
  }
});