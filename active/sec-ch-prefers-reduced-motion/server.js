const express = require("express");
const app = express();

const getHTML = (prefersReducedMotion) => `
<!DOCTYPE html>
<html lang="en">
  <head>
	  <meta charset="utf-8">
	  <title>Sec-CH-Prefers-Reduced-Motion demo</title>
    <script>
      if (!isSecureContext) location.protocol = 'https:';
    </script>
	  <style>
      body { font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>	  
    <pre>Sec-CH-Prefers-Reduced-Motion: ${prefersReducedMotion}</pre>
    <p${prefersReducedMotion === undefined ? " hidden" : ""}>
      Toggle your operating system's preferred reduced motion and examine via DevTools 
      how the image source changes.
    </p>
    <p>
      For more details, visit the
      <a href="https://github.com/wicg/user-preference-media-features-headers">User Preference Media Features Client Hints Headers</a>
      repository.
    </p>
    <img 
      width="200" 
      height="200" 
      src="https://cdn.glitch.global/6fff4524-4aa6-4148-8207-c613d056e655/nyan-cat.${
        prefersReducedMotion == "reduce" ? "png" : "gif"
      }">
  </body>
</html>
`;

app.get("/", (req, res) => {
  res.set("Accept-CH", "Sec-CH-Prefers-Reduced-Motion");
  res.set("Vary", "Sec-CH-Prefers-Reduced-Motion");
  res.set("Critical-CH", "Sec-CH-Prefers-Reduced-Motion");

  const prefersReducedMotion = req.get("sec-ch-prefers-reduced-motion");
  res.send(getHTML(prefersReducedMotion));
});

app.get("/no-critical-ch", (req, res) => {
  res.set("Accept-CH", "Sec-CH-Prefers-Reduced-Motion");
  res.set("Vary", "Sec-CH-Prefers-Reduced-Motion");
  // res.set("Critical-CH", "Sec-CH-Prefers-Reduced-Motion");

  const prefersReducedMotion = req.get("sec-ch-prefers-reduced-motion");
  res.send(getHTML(prefersReducedMotion));
});

app.listen(process.env.PORT);
