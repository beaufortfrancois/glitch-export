import * as React from "react";
import { animated } from "react-spring";
import { useWiggle } from "../hooks/wiggle";
import { Link } from "wouter";

// Our language strings for the header
const strings = [
  "Hello React",
  "Salut React",
  "Hola React",
  "안녕 React",
  "Hej React",
];

// Utility function to choose a random value from the language array
function randomLanguage() {
  return strings[Math.floor(Math.random() * strings.length)];
}

/**
 * The Home function defines the content that makes up the main content of the Home page
 *
 * This component is attached to the /about path in router.jsx
 * The function in app.jsx defines the page wrapper that this appears in along with the footer
 */

export default function Home() {
  /* We use state to set the hello string from the array https://reactjs.org/docs/hooks-state.html
     - We'll call setHello when the user clicks to change the string
  */
  const [hello, setHello] = React.useState(strings[0]);

  /* The wiggle function defined in /hooks/wiggle.jsx returns the style effect and trigger function
     - We can attach this to events on elements in the page and apply the resulting style
  */
  const [style, trigger] = useWiggle({ x: 5, y: 5, scale: 1 });

  // When the user clicks we change the header language
  const handleChangeHello = () => {
    // Choose a new Hello from our languages
    const newHello = randomLanguage();

    // Call the function to set the state string in our component
    setHello(newHello);
  };
  // When the user clicks we toggle PiP
  const handleTogglePiP = async () => {
    // Close Picture-in-Picture window if any.
    if (documentPictureInPicture.window) {
      documentPictureInPicture.window.close();
      return;
    }

    // Open a Picture-in-Picture window.
    const pipWindow = await documentPictureInPicture.requestWindow({
      width: 640,
      height: 360,
    });

    // Copy all style sheets.
    const allCSS = [...document.styleSheets]
      .map((styleSheet) => {
        try {
          return [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
        } catch (e) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      })
      .filter(Boolean)
      .join("\n");
    const style = document.createElement("style");
    style.textContent = allCSS;
    pipWindow.document.head.appendChild(style);

    // Move content to the Picture-in-Picture window.
    const content = document.querySelector(".content");
    pipWindow.document.body.append(content);

    // Listen for the PiP closing event to move the content back.
    pipWindow.addEventListener("pagehide", (event) => {
      const main = document.querySelector("main");
      const pipContent = event.target.querySelector(".content");
      main.append(pipContent);
    });
  };
  return (
    <>
      <h1 className="title">{hello}!</h1>
      {/* When the user hovers over the image we apply the wiggle style to it */}
      <animated.div onMouseEnter={trigger} style={style}>
        <img
          src="https://cdn.glitch.com/2f80c958-3bc4-4f47-8e97-6a5c8684ac2c%2Fillustration.svg?v=1618196579405"
          className="illustration"
          onClick={handleChangeHello}
          alt="Illustration click to change language"
        />
      </animated.div>
      <div className="navigation">
        {/* When the user hovers over this text, we apply the wiggle function to the image style */}
        <animated.div onMouseEnter={trigger}>
          <a className="btn--click-me" onClick={handleChangeHello}>
            1. Click me!
          </a>
        </animated.div>
      </div>
      <div className="navigation">
        {/* When the user hovers over this text, we apply the wiggle function to the image style */}
        <animated.div onMouseEnter={trigger}>
          <a className="btn--click-me" onClick={handleTogglePiP}>
            2. Toggle PiP!
          </a>
        </animated.div>
      </div>
    </>
  );
}
