const CACHE_NAME = 'fishing-tide-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/tide-data.js',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('缓存失败:', err))
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 获取事件 - 缓存优先策略
self.addEventListener('fetch', event => {
  // 跳过非 GET 请求
  if (event.request.method !== 'GET') return;
  
  // 跳过 chrome-extension、data 和 blob URL
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || url.protocol === 'data:' || url.protocol === 'blob:') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到，直接返回
        if (response) {
          return response;
        }

        // 否则发起网络请求
        return fetch(event.request)
          .then(networkResponse => {
            // 检查响应是否有效（移除type判断，允许跨域资源缓存）
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // 克隆响应（因为响应流只能读取一次）
            const responseToCache = networkResponse.clone();

            // 将响应添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] 网络请求失败:', error);
            // 返回友好的离线HTML页面
            return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线模式 - 钓鱼潮汐速查</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%);
      color: white;
      text-align: center;
    }
    .offline-container {
      padding: 40px 20px;
      max-width: 400px;
    }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { font-size: 24px; margin: 0 0 16px; }
    p { color: #b0b0b0; margin: 0 0 24px; }
    button {
      background: #4a9eff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #3a8eef; }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="icon">🎣</div>
    <h1>离线模式</h1>
    <p>无法连接到网络，请检查您的网络连接后重试</p>
    <button onclick="location.reload()">重新加载</button>
  </div>
</body>
</html>`, {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/html; charset=utf-8'
              })
            });
          });
      })
  );
});

// 后台同步（用于离线时保存的数据）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-locations') {
    event.waitUntil(syncLocations());
  }
});

// 模拟同步钓点数据
async function syncLocations() {
  console.log('同步钓点数据...');
  // 实际应用中这里会同步 IndexedDB 中的数据到服务器
}

// 推送通知支持（可选）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '有新的钓鱼提醒',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: '打开应用'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('钓鱼潮汐速查', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});