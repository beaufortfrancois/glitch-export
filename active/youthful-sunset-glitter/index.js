const iframe = document.querySelector("iframe");
const target = document.querySelector("#target");

iframe.onload = async () => {
  const restrictionTarget = await RestrictionTarget.fromElement(target);
  console.log(`Minting ${restrictionTarget}`);
  iframe.contentWindow.postMessage(restrictionTarget, "*");

};
  // setInterval(() => {
  //   target.style.left = parseInt(--target.style.left);
  // }, 100);

target.onclick = (e) => { console.log('click'); e.preventDefault(); }