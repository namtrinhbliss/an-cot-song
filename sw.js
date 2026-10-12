self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'An Cột Sống', body: event.data ? event.data.text() : 'Đã đến giờ nhắc việc của bác.' };
  }
  const title = data.title || 'An Cột Sống';
  const options = {
    body: data.body || 'Bác mở ứng dụng để xem nội dung nhắc việc hôm nay.',
    icon: new URL('icons/icon-192.png', self.registration.scope).href,
    badge: new URL('icons/icon-192.png', self.registration.scope).href,
    tag: data.tag || 'acs-remind',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || new URL('./#hom-nay', self.registration.scope).href }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const target = event.notification.data?.url || new URL('./#hom-nay', self.registration.scope).href;
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});