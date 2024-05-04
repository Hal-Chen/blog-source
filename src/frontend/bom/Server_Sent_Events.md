## SSE 的本质

严格地说，HTTP 协议无法做到服务器主动推送信息。但是，有一种变通方法，就是服务器向客户端声明，接下来要发送的是流信息（streaming）。

也就是说，发送的不是一次性的数据包，而是一个数据流，会连续不断地发送过来。这时，客户端不会关闭连接，会一直等着服务器发过来的新的数据流，
视频播放就是这样的例子。本质上，这种通信就是以流信息的方式，完成一次用时很长的下载。

SSE 就是利用这种机制，使用流信息向浏览器推送信息。它基于 HTTP 协议，目前除了 IE/Edge，其他浏览器都支持。

## SSE 的特点

SSE 与 WebSocket 作用相似，都是建立浏览器与服务器之间的通信渠道，然后服务器向浏览器推送信息。

总体来说，WebSocket 更强大和灵活。因为它是全双工通道，可以双向通信；SSE 是单向通道，
只能服务器向浏览器发送，因为流信息本质上就是下载。如果浏览器向服务器发送信息，
就变成了另一次 HTTP 请求。

- SSE 使用 HTTP 协议，现有的服务器软件都支持。WebSocket 是一个独立协议
- SSE 属于轻量级，使用简单；WebSocket 协议相对复杂。
- SSE 默认支持断线重连，WebSocket 需要自己实现
- SSE 一般只用来传送文本，二进制数据需要编码后传送，WebSocket 默认支持传送二进制数据
- SSE 支持自定义发送的消息类型

## 客户端 API

SSE 的客户端 API 部署在EventSource对象上。使用 SSE 时，浏览器首先生成一个EventSource实例，向服务器发起连接。

```javascript
let source = new EventSource(url);
```

上面的url可以与当前网址同域，也可以跨域。跨域时，可以指定第二个参数，打开withCredentials属性，表示是否一起发送 Cookie。

```javascript
let source = new EventSource(url, { withCredentials: true });
```

EventSource实例的readyState属性，表明连接的当前状态。该属性只读，可以取以下值

```
0：相当于常量EventSource.CONNECTING，表示连接还未建立，或者断线正在重连。

1：相当于常量EventSource.OPEN，表示连接已经建立，可以接受数据。

2：相当于常量EventSource.CLOSED，表示连接已断，且不会重连
```

连接一旦建立，就会触发open事件，可以在onopen属性定义回调函数

```javascript
source.onopen = function (event) {
  // ...
};

source.addEventListener('open', function (event) {
  // ...
}, false);
```

客户端收到服务器发来的数据，就会触发message事件，可以在onmessage属性的回调函数

```javascript
source.onmessage = function (event) {
  let data = event.data;
  // handle message
};

source.addEventListener('message', function (event) {
  let data = event.data;
  // handle message
}, false);
```

如果发生通信错误（比如连接中断），就会触发error事件，可以在onerror属性定义回调函数

```javascript
source.onerror = function (event) {
  // handle error event
};

source.addEventListener('error', function (event) {
  // handle error event
}, false);
```

close方法用于关闭 SSE 连接

```javascript
source.close();
```

## 服务器实现

服务器向浏览器发送的 SSE 数据，必须是 UTF-8 编码的文本，具有如下的 HTTP 头信息

```http
Content-Type: text/event-stream

Cache-Control: no-cache

Connection: keep-alive
```

每一次发送的信息，由若干个message组成，每个message之间用\n\n分隔。每个message内部由若干行组成，每一行都是如下格式

```http
[field]: value\n
```

上面的field可以取四个值

```
data
event
id
retry
```

此外，还可以有冒号开头的行，表示注释。通常，服务器每隔一段时间就会向浏览器发送一个注释，保持连接不中断

```
: This is a comment
```

下面是一个例子。

```
: this is a test stream\n\n

data: some text\n\n
data: another message\n
data: with two lines \n\n
```

**data 字段**

数据内容用data字段表示,如果数据很长，可以分成多行，最后一行用\n\n结尾，前面行都用\n结尾

```
data: begin message\n

data: continue message\n\n
```

**id 字段**

数据标识符用id字段表示，相当于每一条数据的编号。
浏览器用lastEventId属性读取这个值。一旦连接断线，浏览器会发送一个 HTTP 头，
里面包含一个特殊的Last-Event-ID头信息，将这个值发送回来，用来帮助服务器端重建连接。
因此，这个头信息可以被视为一种同步机制

```
id: msg1\n

data: message\n\n
```

**event  字段**

event字段表示自定义的事件类型，默认是message事件。浏览器可以用addEventListener()监听该事件

```
event: userconnect
data: {"username": "bobby", "time": "02:33:48"}

event: usermessage
data: {"username": "bobby", "time": "02:34:11", "text": "Hi everyone."}

event: userdisconnect
data: {"username": "bobby", "time": "02:34:23"}

event: usermessage
data: {"username": "sean", "time": "02:34:36", "text": "Bye, bobby."}
```

**retry   字段**

服务器可以用retry字段，指定浏览器重新发起连接的时间间隔

```
retry: 10000\n
```

两种情况会导致浏览器重新发起连接：一种是时间间隔到期，二是由于网络错误等原因，导致连接出错

## Node 服务器实例

```
let http = require("http");

http.createServer(function (req, res) {
  const fileName = "." + req.url;

  if (fileName === "./stream") {
    res.writeHead(200, {
      "Content-Type":"text/event-stream",
      "Cache-Control":"no-cache",
      "Connection":"keep-alive",
      "Access-Control-Allow-Origin": '*',
    });
    res.write("retry: 10000\n");
    res.write("event: connecttime\n");
    res.write("data: " + (new Date()) + "\n\n");
    res.write("data: " + (new Date()) + "\n\n");

    interval = setInterval(function () {
      res.write("data: " + (new Date()) + "\n\n");
    }, 1000);

    req.connection.addListener("close", function () {
      clearInterval(interval);
    }, false);
  }
}).listen(8844, "127.0.0.1");
```




















