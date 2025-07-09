const express = require('express');
const app = express();

app.get('/', function(request, response) {
  response.set('Feature-Policy', "unsized-media 'none2'");
  response.sendFile(__dirname + '/views/index.html2');
});

app.listen(process.env.PORT);


