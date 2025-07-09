const express = require("express");
const app = express();

const getHTML = (clientHintHeaders) => `
<!DOCTYPE html>
<html lang="en">    
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <head>
	  <meta charset="utf-8">
	  <title>client hints playground</title>
    <script>
      if (!isSecureContext) location.protocol = 'https:';
    </script>
	  <style>
      body { font-family: system-ui, sans-serif; }
    </style>
  </head>
  <body>	  
    <pre>Client hints: <br/>${JSON.stringify(clientHintHeaders, null, 2)}</pre>
  </body>
</html>
`;

app.get("/", (req, res) => {
  const clientHintNames = [
    "device-memory",
    "dpr",
    "width",
    "viewport-width",
    "rtt",
    "downlink",
    "ect",
    "sec-ch-ua",
    "sec-ch-ua-arch",
    "sec-ch-ua-platform",
    "sec-ch-ua-model",
    "sec-ch-ua-mobile",
    "sec-ch-ua-full-version",
    "sec-ch-ua-platform-version",
    "sec-ch-prefers-color-scheme",
    "sec-ch-prefers-reduced-motion",
    "sec-ch-ua-bitness",
    "sec-ch-ua-reduced",
    "sec-ch-ua-bitness",
    "sec-ch-ua-viewport-height",
    "sec-ch-device-memory",
    "sec-ch-dpr",
    "sec-ch-width",
    "sec-ch-viewport-width",
    "sec-ch-ua-full-version-list",
    "sec-ch-ua-full",
    "sec-ch-ua-wow64",
    "save-data",
    "sec-ch-viewport-height",
  ];
  res.set("Accept-CH", clientHintNames.join(", "));
  res.set("Vary", clientHintNames.join(", "));
  res.set("Critical-CH", clientHintNames.join(", "));

  let clientHintHeaders = {};
  for (const headerName of Object.keys(req.headers).sort()) {
    if (!clientHintNames.includes(headerName)) continue;
    clientHintHeaders[headerName] = req.headers[headerName];
  }

  res.send(getHTML(clientHintHeaders));
});

app.listen(process.env.PORT);
