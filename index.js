import express from 'express';
import cors from 'cors';
import dns from 'dns';
import bodyParser from 'body-parser';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';


const urls = new Map();

let index = 0;

function checkUrlMiddleware(req, res, next) {
  if (req.method === 'POST') {
    if (req.body.url === null || req.body.url === undefined) {
      res.status(400);
      res.json({ error: 'no url informed' });
    }
  }
  next();
}

const server = express();
// server.use(express.json());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());

server.get('/', async (req, res) => {
  res.json({ status: 'online' });
});

server.get('/api/shorturl/:url', async (req, res, next) => {
  console.log(req.params.url, typeof req.params.url);
  const url = urls.get(parseInt(req.params.url, 10));
  console.log(url);
  if (url != null) {
    res.redirect(url);
  } else {
    res.json({ error: 'url not found' });
  }
});

server.use(checkUrlMiddleware);

server.post('/api/shorturl/', async (req, res) => {
  let { url } = req.body;
  let urlTemp = url.split('?')[0];
  if (urlTemp.endsWith('/')) {
    urlTemp = urlTemp.slice(0, -1);
  }
  console.log('URL sent: ' + url);
  console.log('URLTemp: ' + urlTemp);
  let valid = true;
  if (urlTemp.startsWith('https')) {
    urlTemp = urlTemp.substring(8);
  } else if (urlTemp.startsWith('http')) {
    urlTemp = urlTemp.substring(7);
  }
  dns.lookup(urlTemp, (err, addresses) => {
    console.log(addresses);
    if (addresses === null || addresses === undefined) {
      valid = false;
    }
    if (!valid) {
      res.status(404);
      return res.json({ error: 'invalid url' });
    }
    index += 1;
    urls.set(index, url);
    console.log(urls);
    res.status(201);
    return res.json({ original_url: url, short_url: index });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Starting app on port ${PORT}`);
});
