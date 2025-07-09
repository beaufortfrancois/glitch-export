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
  btn.onclick = async function () {
    pre.textContent += "click\r\n";
    // The JS works in conjunction with the 'dipped' code in style.css
    btn.classList.toggle("dipped");
    if (navigator.share) {
      pre.textContent += `sharing ${JSON.stringify(window.location)}\r\n`;
      try {
        await navigator.share({ title: "Hello", url: window.location });
        pre.textContent += `shared\r\n`;
      } catch (error) {
        pre.textContent += `error: ${JSON.stringify(error.message)}\r\n`;
      }
    }
  };
}

// This is a single line JS comment
/*
This is a comment that can span multiple lines 
- use comments to make your own notes!
*/
