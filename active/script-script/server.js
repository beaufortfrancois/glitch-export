const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/script.js', function(request, response) {
  const { timeout = 0 }  = request.query;
  setTimeout(function() {
    response.type('.js');
    response.send(`console.log('  ${request.url}');`);
  }, timeout);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
