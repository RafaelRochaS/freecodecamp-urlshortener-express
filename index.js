import express from 'express';
import cors from 'cors';
import dns from 'dns';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';


const urls = new Map();

let index = 0;

function checkUrlMiddleware(req, res, next) {
  if (req.method === 'POST') {
    if (req.body['url'] === null || req.body['url'] === undefined) {
      res.status(400);
      res.json({ error: 'no url informed' });
    }
  }
  next();
}

const server = express();
server.use(express.json());
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
  let valid = true;
  if (url.startsWith('https')) {
    url = url.substring(8);
  } else if (url.startsWith('http')) {
    url = url.substring(7);
  }
  dns.lookup(url, (err, addresses) => {
    console.log(addresses);
    if (addresses === null || addresses === undefined) {
      valid = false;
    }
    if (!valid) {
      res.status(400);
      return res.json({ error: 'invalid url' });
    }
    index += 1;
    urls.set(index, req.body['url']);
    console.log(urls);
    res.status(201);
    return res.json({ original_url: req.body['url'], short_url: index });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Starting app on port ${PORT}`);
});
