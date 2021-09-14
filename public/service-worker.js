// 01/01/2022

const badge = '/img/badge_icon_x192.png';
const icon = '/img/round_icon_x512.png';

// Install event
self.addEventListener('install', async e => {
	console.log('Service worker installed');

	// Show notification
	self.registration.showNotification('Update', {
		body: 'App is updating...',
		badge,
		icon,
		tag: 'update',
		requireInteraction: true
	});

	self.skipWaiting();
});

// Activate event
self.addEventListener('activate', async e => {
	console.log('Service worker activated');

	// Delete main and nav caches
	caches.delete('main');
	caches.delete('nav');

	// Show notification
	self.registration.showNotification('Update', {
		body: 'App updated.',
		actions: [{ title: 'Reload', action: 'reload' }],
		badge,
		icon,
		tag: 'update',
		renotify: true
	});

	self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', e => e.respondWith(respond(e)));

async function respond(e) {
	return fetch(e.request);
}

// Refresh clients
async function refreshClients() {
	const client_list = await self.clients.matchAll();
	for (const client of client_list) client.navigate?.('/');
}

// Notification click
self.addEventListener('notificationclick', e => {
	// Close action
	if (e.action === 'close') e.notification.close();

	// Reload action
	if (e.action === 'reload') refreshClients();
});

// Notification close
self.addEventListener('notificationclose', e => {});

// Broadcast channel
const channel = new BroadcastChannel('sw-messages');

// Broadcast messages
channel.addEventListener('message', async e => {});
