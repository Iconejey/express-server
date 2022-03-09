const express = require('express');
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');
const compression = require('compression');

const ip = require('ip');

const route = require('./route');
const { colors, log } = require('./console');

require('dotenv').config();

const package = require('../package.json');
const manifest = require('../public/manifest.json');
const domain = new URL(manifest.related_applications[0].url).hostname;
const dev_mode = process.env.NODE_ENV === 'development';

// // // // // // // // // // // // // // //

// Show app header
{
	const app_url = dev_mode || !manifest ? `https://${ip.address()}` : domain;
	const package_name = package.name.replace(/^./, str => str.toUpperCase());

	// Clear console
	console.clear();

	// Show running mode
	console.log(`\n${dev_mode ? colors.yellow : colors.green}Running in ${dev_mode ? 'development' : 'production'} mode${colors.white}`);

	// Show package name and version
	console.log(`${package_name} version ${colors.green}${package.version}${colors.white}`);

	// Show app url
	console.log(`Available at ${colors.blue}${app_url}${colors.white}\n`);
}

// // // // // // // // // // // // // // //

// Get the language and country of a request (ex: 'fr-FR')
const getCountry = req => {
	const acclang = req.headers['accept-language'];
	return acclang ? acclang.slice(0, 2) + '-' + acclang.slice(3, 5).toUpperCase() : 'N/A';
};

// App
const app = express();

// Basic middlewares
{
	app.enable('trust proxy');
	app.use(compression());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(useragent.express());
	app.use(fileUpload());

	// Filter and log connections
	app.use(async (req, res, next) => {
		const ip = req.ip?.replace('::ffff:', '').replace('::1', 'localhost').replace('127.0.0.1', 'localhost');
		const country = getCountry(req);

		const authorized = ['localhost', domain].includes(req.hostname);
		const device = req.useragent.isMobile ? 'mobile' : 'desktop';
		const secure = req.secure || req.hostname === 'localhost';
		const file = req.url.split('/').slice(-1)[0];

		// Only log navigation requests
		const signifiant = !file.includes('.');

		// if connection logs are enabled and the request is significant
		if (process.env.LOG_CONNECTIONS == 1 && signifiant) {
			// yellow for http, green for https, red for refused and blue for auth credentials.
			let color = 'red';
			if (authorized) color = secure ? 'green' : 'yellow';

			// Log connection
			log(` > ${ip} (${country}, ${device}, ${req.hostname})`, color);
		}

		// Redirect www to non-www
		if (secure && req.hostname.startsWith('www.')) return res.redirect(`https://${req.hostname.slice(4)}${req.url}`);

		// If the request is authorized, continue
		if (authorized) next();
	});
}

route(app);

// // // // // // // // // // // // // // //

let port = 80;

// If in prod, use proxy's config port
if (!dev_mode) {
	const config = require('../../proxy/config.json');
	port = config.find(c => __dirname.includes(c.repo)).port || port;
}

// HTTP
app.listen(port, () => {
	console.log(`${colors.blue}http${colors.white} server listening on port ${colors.yellow}${port}${colors.white}`);
});
