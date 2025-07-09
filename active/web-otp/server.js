const express = require('express');
const app = express();
const hbs = require('hbs');

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());

const HOSTNAME = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;

// Redirect to HTTPS
app.use((req, res, next) => {
  if (req.get('x-forwarded-proto') &&
     (req.get('x-forwarded-proto')).split(',')[0] !== 'https') {
    return res.redirect(301, HOSTNAME);
  }
  req.schema = 'https';
  next();
});

app.get('/', (req, res) => {
  res.render('index.html');
});

app.post('/post', (req, res) => {
  res.render('post.html');
});

app.get('/iframe', (req, res) => {
  res.render('iframe.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
