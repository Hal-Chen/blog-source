# CacheStorage

## caches.open

如果指定的 Cache 不存在，则使用该 cacheName 创建一个新的 cache，并返回一个 resolve 为该新 Cache 对象的Promise

```javascript
caches.open(cacheName).then(function (cache) {
  // Do something with your cache
});
```

## 添加到缓存

````javascript
myCache.add("/subscribe");

myCache.add(new Request('/subscribe', {
    method: "GET",
    headers: new Headers({
      'Content-Type': 'text/html'
    })
  })
)

myCache.addAll(["/subscribe", "/assets/images/profile.png"])
````

## 读取缓存

```javascript
const res = await myCache.match("/subscribe");
```

## 更新缓存

```javascript
const request = new Request("/subscribe");
const fetchResponse = await fetch(request);
myCache.put(request, fetchResponse);
```

## 删除缓存

```javascript
myCache.delete("/subscribe");
caches.delete("myCache"); // 销毁整个命名空间
```

## 结合serviceWorker

```javascript
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request);
    })
  );
});
```

