/*
This is your site JavaScript code - you can add interactivity and carry out processing
- Initially the JS writes a message to the console, and moves a button you can add from the README
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello 🌎");

/* 
Make the "Click me!" button move when the visitor clicks it:
- First add the button to the page by following the "Next steps" in the README
*/
const btn = document.querySelector("button"); // Get the button from the page
// Detect clicks on the button
if (btn) {
  btn.onclick = async function() {
    console.log(`[1] document.hidden = ${document.hidden}`);
    const stream = await navigator.mediaDevices.getDisplayMedia();
    console.log(`[2] document.hidden = ${document.hidden}`);
    const video = document.createElement("video");
    
    // video.srcObject = stream;

    video.muted = true;
    const canvas = document.createElement("canvas");
    canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
    video.srcObject = canvas.captureStream();

    await video.play();
    console.log(`[3] document.hidden = ${document.hidden}`);
    
    await video.requestPictureInPicture();
    console.log(`[4] document.hidden = ${document.hidden}`);
  };
}

// This is a single line JS comment
/*
This is a comment that can span multiple lines 
- use comments to make your own notes!
*/
