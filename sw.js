const CACHE = 'meimei-v3';
const ASSETS = [
  '/meimei-wishlist/',
  '/meimei-wishlist/index.html',
  '/meimei-wishlist/manifest.json',
  '/meimei-wishlist/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // 跳过所有外部API请求，只缓存本地资源
  if(url.includes('supabase.co') ||
     url.includes('jsonbin.io') ||
     url.includes('vercel.app') ||
     url.includes('upstash.io') ||
     url.includes('amap.com') ||
     url.includes('open-meteo.com') ||
     url.includes('emailjs.com') ||
     url.includes('googleapis.com') ||
     url.includes('jsdelivr.net') ||
     !url.startsWith('https://alexanderzyd.github.io')){
    return; // 让浏览器直接处理
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
