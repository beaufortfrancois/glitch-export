const express = require('express');
const app = express();

const path = require('path');

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get("/", function (request, response) {
  const featureNames = ['accelerometer', 'ambient-light-sensor', 'autoplay', 'camera', 'encrypted-media', 'fullscreen', 'geolocation', 'gyroscope', 'magnetometer', 'microphone', 'midi', 'payment', 'picture-in-picture', 'speaker', 'sync-xhr', 'usb', 'vibrate', 'vr'];
  const featurePolicy = featureNames.map(name => name + ' \'none\';').join(' ');
  response.set('Feature-Policy', featurePolicy);
  //response.send(`Feature-Policy: ${featurePolicy}`);
  response.render('homepage', { featurePolicy: featurePolicy });
});

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
