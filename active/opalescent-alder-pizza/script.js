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
  btn.onclick = function () {
    console.log("click");
    setTimeout(async () => {
      const image = new Image();
      image.loading = "eager";
      image.decoding = "sync";
      // image.crossOrigin = true;
      image.src =
        "https://cdn.glitch.global/a28fa829-b401-4c50-8a95-57a687dae074/bluetooth.png?v=1644996926573";
      try {
        console.log("decoding", image);
        const res = await image.decode();
        console.log("decoded", res);
      } catch (error) {
        console.log("decoded", error);
      }
    }, 2000);
  };
}

// This is a single line JS comment
/*
This is a comment that can span multiple lines 
- use comments to make your own notes!
*/
