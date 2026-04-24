const CACHE_NAME = 'stockdash-v2'; // v1에서 v2로 캐시 버전 업그레이드
const CACHE_URLS = [
  './stock_pwa.html',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Pretendard:wght@400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // 주가 API 및 CDN은 항상 네트워크 우선
  if (e.request.url.includes('yahoo') || e.request.url.includes('naver') || e.request.url.includes('gemini') || e.request.url.includes('duckbai') || e.request.url.includes('jsdelivr')) {
    e.respondWith(fetch(e.request).catch(() => new Response('offline', {status: 503})));
    return;
  }
  // 나머지는 캐시 우선
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});