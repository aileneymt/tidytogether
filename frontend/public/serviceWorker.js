const STATIC_CACHE_NAME = "tidytogether-static-v1";

function log(...data) {
    console.log("SWv1.0", ...data);
}

log("SW Script executing - adding event listeners");

self.addEventListener('install', event => {
    log('install', event);
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/vite.svg',
                    '/assets/index-B-RWEMIv.js',
                    '/assets/index-Ck8KSX8N.css',
                    '/offline.html',
                    '/offline.css'
                ]);
            })
    );
    // As soon as this method returns, the service worker is considered installed
});

self.addEventListener('activate', event => {
    log('activate', event);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => cacheName.startsWith('tidytogether-') && cacheName != STATIC_CACHE_NAME)
        }).then(oldCaches => {
            return Promise.all(
                oldCaches.map(cacheName => caches.delete(cacheName))
            );
        })
    );
    // As soon as this method returns, the service worker is considered active
});


self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);

    // Handle navigation requests (e.g. React Router paths like /login)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html')
                .then(response => {
                    return response || fetch(event.request);
                })
                .catch(() => caches.match('/offline'))
        );
        return;
    }

    // API calls – use network-first
    if (requestURL.origin === self.location.origin && requestURL.pathname.startsWith('/api')) {
        event.respondWith(
            networkFirst(event.request)
        );
        return;
    }

    // Static assets – use cache-first
    event.respondWith(
        cacheFirst(event.request)
    );
});

// method called by fetch listener
function fetchAndCache(req) {
    return fetch(req)
        .then(res => {
            if (res.ok && req.method === 'GET') {
                caches.open(STATIC_CACHE_NAME).then(cache => {
                    cache.put(req, res);
                })
            }
            return res.clone();
        });
}
//return fetch
// return repsones.clone()

function cacheFirst(req) {
    return caches.match(req).then(res => {
        if (res) {
            return res;
        } else {
            return fetchAndCache(req);
        }
    }).catch(err => {
        return caches.match('/offline');
    });
}

function networkFirst(req) {
    return fetchAndCache(req)
        .catch(err => {
            return caches.match(req);
        })
        .then(res => {
            if (res) {
                return res;
            } else {
                return caches.match('/offline');
            }
        });
}

self.addEventListener('message', event => {
    log('message', event.data);
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

/********************\
*     Indexed DB     *
\********************/


