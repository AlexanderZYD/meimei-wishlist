const CACHE = 'meimei-v5';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // HTML / 导航请求始终优先走网络，避免页面更新后仍显示旧版本
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  
  // 永远不缓存这些，直接走网络
  if(
    url.includes('index.html') ||
    url.includes('meimei-wishlist/') && !url.includes('.') ||
    url.includes('supabase.co') ||
    url.includes('jsonbin.io') ||
    url.includes('vercel.app') ||
    url.includes('upstash.io') ||
    url.includes('amap.com') ||
    url.includes('open-meteo.com') ||
    url.includes('emailjs.com') ||
    url.includes('googleapis.com') ||
    url.includes('jsdelivr.net')
  ){
    e.respondWith(fetch(e.request).catch(() => new Response('offline')));
    return;
  }
  
  // 只缓存图标等静态资源
  if(url.includes('.png') || url.includes('.svg') || url.includes('manifest.json')){
    e.respondWith(
      caches.match(e.request).then(cached => 
        cached || fetch(e.request).then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
      )
    );
    return;
  }
  
  // 其他请求直接走网络
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
