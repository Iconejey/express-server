const express = require('express');
const useragent = require('express-useragent');
const imageDataURI = require('image-data-uri');
const { log } = require('./console');
const fs = require('fs');

// Restricting connexion to fr-FR
const authorized_countries = ['fr-FR'];

// Get the lang and country of a request (ex: 'fr-FR')
const getCountry = req => {
	const acclang = req.headers['accept-language'];
	return acclang ? acclang.slice(0, 2) + '-' + acclang.slice(3, 5).toUpperCase() : 'N/A';
};

// Allow log connetions
let log_connections = true;

// Main function called by both http and https servers
module.exports = function route(app) {
	// Body Parser
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(useragent.express());

	// Middleware
	app.use(async (req, res, next) => {
		const ip = req.ip.replace('::ffff:', '').replace('::1', 'localhost').replace('127.0.0.1', 'localhost');
		const country = getCountry(req);

		const authorized = authorized_countries.includes(country);
		const device = req.useragent.isMobile ? 'mobile' : 'desktop';
		const secure = req.hostname === 'localhost' || req.protocol === 'https';

		// Only log navigation requests
		const file = req.url.split('/').slice(-1)[0];
		const is_nav = !file.includes('.');

		// if connection logs are enabled and the request is a navigation request
		if (log_connections && is_nav) {
			// yellow for http, green for https and red for refused.
			let color = 'red';
			if (authorized) color = secure ? 'green' : 'yellow';

			// Log connection
			log(` > ${ip} (${country}, ${device})`, color);
		}

		if (!secure) res.redirect(`https://${req.hostname}${req.url}`);
		else if (authorized || authentication) next();
	});

	// Global
	app.use('/', express.static('public'));

	// 404
	app.get('*', (req, res) => {
		res.sendFile('404.html', { root: __dirname });
	});
};
