// IlmPortal Service Worker - Smooth SPA Notification Handling without Reloading
const CACHE_NAME = 'ilmportal-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle notification click on Desktop & Mobile OS without reloading the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an IlmPortal window is already open, focus it and navigate via SPA postMessage
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({
            type: 'ILMPORTAL_NOTIFICATION_NAVIGATE',
            url: targetUrl
          });
          return client;
        }
      }

      // 2. If no window is open at all, launch a fresh browser window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle push events if PushManager is utilized
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    const title = payload.title || 'IlmPortal Notification';
    const options = {
      body: payload.body || 'You have a new update.',
      icon: payload.icon || '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      data: {
        url: payload.url || '/'
      },
      tag: payload.tag || 'ilmportal-general'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Service Worker push error:', err);
  }
});
