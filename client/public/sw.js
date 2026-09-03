// IlmPortal Service Worker - Handles Desktop & Mobile Push Notifications & Smooth Focusing
const CACHE_NAME = 'ilmportal-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle notification click on Desktop & Mobile OS without unnecessary reloading
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';
  const targetFullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an IlmPortal window is already open, focus it
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            const cl = focusedClient || client;
            // If already on the exact target URL, simply focusing is enough (no reload)
            if (cl.url === targetFullUrl) {
              return cl;
            }
            // If on another page, navigate to the target conversation
            if ('navigate' in cl) {
              return cl.navigate(targetFullUrl);
            }
            return cl;
          });
        }
      }

      // 2. If no window is open at all, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetFullUrl);
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
      icon: payload.icon || '/icon.png',
      badge: '/icon.png',
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
