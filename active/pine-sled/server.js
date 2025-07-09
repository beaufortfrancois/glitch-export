function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/slow-load.html', async function(request, response) {
  await sleep(10000);
  response.sendFile(__dirname + '/views/slow-load.html');
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
