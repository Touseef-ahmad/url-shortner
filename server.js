require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const ShortUrl = mongoose.model('ShortUrl', { original_url: String });

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const { body } = req;
  const { url } = body;
  console.log('url -> ', url);
  try {
    const validURL = new URL(url);
    console.log(validURL.protocol)
    if(validURL.protocol !== 'https:' && validURL.protocol !== 'http:') {
      throw new Error;
    }
  } catch (e) {
    res.send({ error: 'invalid url' })
  }
  ShortUrl.findOne({ original_url: url }, function (error, document) {
    if (!document) {
      const newURL = new ShortUrl({ original_url: url });
      newURL.save().then((doc) => {
        res.send({ original_url: url, short_url: doc._id });
      });
    } else {
      res.send({ original_url: url, short_url: document._id });
    }
  })
})

app.get('/api/shorturl/:short', async (req, res) => {
  const { short } = req.params;
  const doc = await ShortUrl.findById(short);
  res.redirect(doc.original_url);
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
