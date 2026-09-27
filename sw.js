const CACHE_NAME = "school-dashboard-v13";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    // Only handle requests belonging to this website.
    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

self.addEventListener("push", event => {
    if (!event.data) return;

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(
            data.title || "Classroom Dashboard",
            {
                body: data.body || "",
                icon: data.icon || "./icon.svg",
                tag: data.tag || "classroom-test"
            }
        )
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({
            type: "window"
        }).then(clients => {

            for (const client of clients) {
                if (
                    client.url.includes(self.location.origin) &&
                    "focus" in client
                ) {
                    return client.focus();
                }
            }

            return self.clients.openWindow("./");
        })
    );
});
