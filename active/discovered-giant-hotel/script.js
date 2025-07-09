button.onclick = async function () {
  const pipWindow = await window.requestPictureInPictureWindow({
    width: 100,
    height: 100,
  });

  // const html = await (await fetch('theannoyingsitecom.js')).text();
  // const script = await (await fetch('theannoyingsitecom.js')).text();

  // pipWindow.document.write(`<script src="theannoyingsitecom.js"></script>`);

  const scriptElement = document.createElement("script");
  // scriptElement.src = "theannoyingsitecom.js";
  // scriptElement.src = "https://discovered-giant-hotel.glitch.me/theannoyingsitecom.js";
  pipWindow.document.body.append(scriptElement);
};
