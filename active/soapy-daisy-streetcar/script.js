(async () => {
  const a = await navigator.gpu.requestAdapter();
  console.log(await a.requestAdapterInfo()); 
})();