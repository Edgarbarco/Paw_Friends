const https = require('https');
https.get('https://dns.google/resolve?name=huellitas.j4m7p.mongodb.net&type=TXT', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(JSON.parse(data)); });
});
