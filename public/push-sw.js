// Web-push handlers, pulled into the generated Workbox service worker through
// workbox.importScripts (vite.config.ts). Payloads come from the send-push
// Edge Function: { title, body, url, tag }.

const fallbackMessage = { title: "Moti", body: "", url: "/" };

const pushMessageOf = (data) => {
  if (!data) return fallbackMessage;
  try {
    const message = data.json();
    return {
      title: message.title || fallbackMessage.title,
      body: message.body || "",
      url: message.url || "/",
      tag: message.tag,
    };
  } catch {
    return { ...fallbackMessage, body: data.text() };
  }
};

self.addEventListener("push", (event) => {
  const message = pushMessageOf(event.data);
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      tag: message.tag,
      icon: "/pwa-192x192.png",
      badge: "/pwa-64x64.png",
      data: { url: message.url },
    }),
  );
});

// Focus an open Moti window and route it, or open a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = (event.notification.data && event.notification.data.url) || "/";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows[0];
      if (!open) return self.clients.openWindow(target);
      return open.focus().then((focused) =>
        focused.url === target
          ? focused
          : focused.navigate(target).catch(() => self.clients.openWindow(target)),
      );
    }),
  );
});
