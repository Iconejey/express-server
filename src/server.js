const express = require('express');
const https = require('https');
const fs = require('fs');
const route = require('./route');
const { colors } = require('./console');

console.clear();

// App
const app = express();
route(app);

// Options
const options = {
	key: fs.readFileSync('./cert/private_key.key'),
	cert: fs.readFileSync('./cert/ssl_certificate.cer')
};

// HTTP
app.listen(80, () => {
	console.log(`${colors.green}http${colors.white} server listening...`);
});

// HTTPS
https.createServer(options, app).listen(443, () => {
	console.log(`${colors.yellow}https${colors.white} server listening...`);
});
