---
name: pwa-conventions
description: How Moti works as an installable, offline-capable PWA — vite-plugin-pwa manifest and icons, the Workbox caching rules (what is precached, what is never cached), index.html meta, safe areas, the online/offline state and banner, install and update prompts, and how to verify a service-worker change. Use before touching vite.config.ts, index.html, public/ icons, caching, offline behaviour or install/update UX.
---

# PWA Conventions

Moti is installable and keeps working offline. The config shape is copied from
`Dcwd_Work/dcwd_apps-crm-customer2/vite.config.ts` and `index.html`; offline writes follow
`Ejie_Business/TARTAR` (`supabase-backend` § D).

## 1. vite-plugin-pwa

Configured once in `vite.config.ts` via `VitePWA({...})`:

```ts
VitePWA({
  registerType: "prompt",                 // the app asks before swapping versions (§ 5)
  includeAssets: ["favicon.svg", "apple-touch-icon.png"],
  manifest: {
    name: "Moti",
    short_name: "Moti",
    description: "<one line from the Moti spec>",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",                   // tablets at the counter use landscape
    theme_color: "<matches --primary in theme.css>",
    background_color: "<matches --background in theme.css>",
    icons: [
      { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  workbox: { /* § 2 */ },
  devOptions: { enabled: false },
})
```

- `theme_color` / `background_color` are the hex values of `--primary` / `--background` — the
  one place outside `theme.css` a colour literal is allowed, with a `//` saying which token it
  mirrors. Change both together.
- Icons live in `public/`: `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`
  (content inside the 80% safe zone), `apple-touch-icon.png` (180×180), `favicon.svg`.
- `registerType: "prompt"` is the default here because an offline write queue must not be
  interrupted by a silent reload. Switching to `autoUpdate` is a decision to ask about.

## 2. Caching — what the service worker may hold

```ts
workbox: {
  navigateFallback: "index.html",          // SPA deep links load the shell offline
  globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  runtimeCaching: [
    { urlPattern: ({ request }) => request.destination === "image",
      handler: "StaleWhileRevalidate",
      options: { cacheName: "moti-images", expiration: { maxEntries: 60, maxAgeSeconds: 2592000 } } },
    { urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
      handler: "StaleWhileRevalidate", options: { cacheName: "google-fonts-stylesheets" } },
    { urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
      handler: "CacheFirst",
      options: { cacheName: "google-fonts-files", cacheableResponse: { statuses: [0, 200] },
                 expiration: { maxEntries: 20, maxAgeSeconds: 31536000 } } },
  ],
}
```

- **The service worker never caches Supabase API, auth or storage-signed responses.** Data
  freshness and offline reads belong to React Query (and its persisted cache if added), writes to
  the `runWrite` queue. A Workbox route matching `*.supabase.co` is a bug — it can serve one
  user's data to another and it caches auth tokens.
- Large images are cached on demand (runtime), not precached, to keep first install light.
- If the app is ever served under a base path shared with other apps, add a
  `navigateFallbackAllowlist` (see crm-customer2) so the worker never answers sibling routes.

## 3. index.html

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="theme-color" content="<same as manifest theme_color>" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Moti" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

`viewport-fit=cover` is what exposes `env(safe-area-inset-*)`; pinch-zoom stays enabled for
accessibility. Safe-area utilities (`pt-safe`, `pb-safe`, `px-safe`, `pb-tabbar`, `h-dvh-safe`)
are defined once in `styles/common/theme.css` and used by the shell (`ui-design-conventions` § 8).

## 4. Online / offline state

- One `store/common/network.store.ts` holds `online`, updated by `window` `online`/`offline`
  listeners registered once (in `hook/common/network.hook.ts`, mounted by the shell). Components
  read it through the hook — never `navigator.onLine` in a component.
- Coming back online triggers `useSyncStore.getState().flush()` and
  `queryClient.invalidateQueries()` for anything stale.
- The shell shows a small offline banner (and the pending-write count from the sync store) while
  offline. Screens keep rendering their cached data; online-only actions disable themselves with a
  reason, rather than failing on press.
- React Query: set `networkMode: "offlineFirst"` on the QueryClient if the Moti spec needs
  cached reads offline; a persisted query cache is a dependency decision — ask first.

## 5. Install and update

- **Update:** use `useRegisterSW` from `virtual:pwa-register/react` in one hook; when
  `needRefresh` is true show a non-blocking prompt ("A new version is ready — Reload"). Do not
  reload while the write queue is flushing.
- **Install:** capture `beforeinstallprompt` once into a store and expose an "Install app" action
  (settings or a dismissible card). iOS has no event — show the "Share → Add to Home Screen" hint
  only on iOS Safari when not already standalone (`display-mode: standalone`).
- Add `/// <reference types="vite-plugin-pwa/react" />` (and `/client`) to `src/vite-env.d.ts`.

## 6. Verify

- Any change to `vite.config.ts`, `index.html`, `public/` icons or the service worker: `yarn build`.
- The service worker only exists in a production build. The user tests with `yarn preview` (never
  start it yourself): DevTools → Application → Manifest / Service Workers, toggle Offline, reload,
  and run a Lighthouse PWA audit.
- Report a PWA change as built, and list exactly what the user should check in DevTools.
