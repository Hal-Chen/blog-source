## 概述

通俗地说，IndexedDB 就是浏览器提供的本地数据库，它可以被网页脚本创建和操作。IndexedDB 允许储存大量数据，提供查找接口，还能建立索引。

就数据库类型而言，IndexedDB 不属于关系型数据库（不支持 SQL 查询语句），更接近 NoSQL 数据库。

IndexedDB 具有以下特点。

- **键值对储存**， IndexedDB 内部采用对象仓库（object store）存放数据。所有类型的数据都可以直接存入，包括 JavaScript 对象。
象仓库中，数据以"键值对"的形式保存，每一个数据记录都有对应的主键，主键是独一无二的，不能有重复，否则会抛出一个错误。
- **异步**， IndexedDB 操作时不会锁死浏览器，用户依然可以进行其他操作，这与 LocalStorage 形成对比，后者的操作是同步的。
异步设计是为了防止大量数据的读写，拖慢网页的表现。
- **支持事务**， IndexedDB 支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，
数据库回滚到事务发生之前的状态，不存在只改写一部分数据的情况。
- **同源限制**， IndexedDB 受到同源限制，每一个数据库对应创建它的域名。网页只能访问自身域名下的数据库，而不能访问跨域的数据库。
- **储存空间大** ，IndexedDB 的储存空间比 LocalStorage 大得多，一般来说不少于 250MB，甚至没有上限。
- **支持二进制储存**， IndexedDB 不仅可以储存字符串，还可以储存二进制数据（ArrayBuffer 对象和 Blob 对象）。

## 基本概念

- **数据库**：IDBDatabase 对象
- **对象仓库**：IDBObjectStore 对象
- **索引**： IDBIndex 对象
- **事务**： IDBTransaction 对象
- **操作请求**：IDBRequest 对象
- **指针**： IDBCursor 对象
- **主键集合**：IDBKeyRange 对象

**数据库**: 数据库是一系列相关数据的容器。每个域名（严格的说，是协议 + 域名 + 端口）都可以新建任意多个数据库。
IndexedDB 数据库有版本的概念。同一个时刻，只能有一个版本的数据库存在。如果要修改数据库结构（新增或删除表、索引或者主键），只能通过升级数据库版本完成。

**对象仓库**：每个数据库包含若干个对象仓库（object store）。它类似于关系型数据库的表格。

**数据记录**: 对象仓库保存的是数据记录。每条记录类似于关系型数据库的行，但是只有主键和数据体两部分。
主键用来建立默认的索引，必须是不同的，否则会报错。主键可以是数据记录里面的一个属性，也可以指定为一个递增的整数编号。
`{ id: 1, text: 'foo' }` 这个对象中，id属性可以当作主键。 数据体可以是任意数据类型，不限于对象。

**索引**：为了加速数据的检索，可以在对象仓库里面，为不同的属性建立索引。

**事务**：数据记录的读写和删改，都要通过事务完成。事务对象提供error、abort和complete三个事件，用来监听操作结果。

## 操作流程

### 打开数据库

```javascript
const request = window.indexedDB.open('test', 1);
let db

request.onerror = function (event) {
  console.log('数据库打开报错', event);
};

request.onsuccess = function (event) {
  console.log('数据库打开成功', event);
  db = request.result; // db = event.target.result
};

// 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件
request.onupgradeneeded = function (event) {
  db = event.target.result;
}
```

### 新建数据库

新建数据库与打开数据库是同一个操作。如果指定的数据库不存在，就会新建。不同之处在于，后续的操作主要在upgradeneeded事件的监听函数里面完成，
因为这时版本从无到有，所以会触发这个事件。 通常，新建数据库以后，第一件事是新建对象仓库（即新建表）。

```javascript
request.onupgradeneeded = function (event) {
  db = event.target.result;
  let objectStore
  if (!db.objectStoreNames.contains('person')) {
    // 新增一张叫做person的表格，主键是id
    objectStore = db.createObjectStore('person', {keyPath: 'id'});
    // 如果数据记录里面没有合适作为主键的属性，那么可以让 IndexedDB 自动生成主键。
    objectStore = db.createObjectStore('person', {autoIncrement: true});

    // 新建对象仓库以后，下一步可以新建索引
    objectStore.createIndex('name', 'name', {unique: false});
    objectStore.createIndex('email', 'email', {unique: true});
  }
}
```

### 新增数据

写入数据需要新建一个事务。新建时必须指定表格名称和操作模式（"只读"或"读写"）。新建事务以后，通过`IDBTransaction.objectStore(name)`方法，
拿到 `IDBObjectStore` 对象，再通过表格对象的`add()`方法，向表格写入一条记录

```javascript
function add() {
  const request = db.transaction(['person'], 'readwrite') // readonly
    .objectStore('person')
    .add({id: 1, name: '张三', age: 24, email: '123456@qq.com'});

  request.onsuccess = function (event) {
    console.log('数据写入成功');
  };

  request.onerror = function (event) {
    console.log('数据写入失败', event);
  }
}
```

### 读取数据

```javascript
function read() {
  const transaction = db.transaction(['person']);
  const objectStore = transaction.objectStore('person');
  const request = objectStore.get(1);

  request.onerror = function (event) {
    console.log('读取失败', event);
  };

  request.onsuccess = function (event) {
    console.log(request.result, event.target.result); // 两者等价
  };
}
```

### 遍历数据

```javascript
function readAll() {
  const objectStore = db.transaction('person').objectStore('person');
  // 遍历数据表格的所有记录，要使用指针对象 IDBCursor。
  objectStore.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      console.log(cursor.value);
      cursor.continue();
    } else {
      console.log('没有更多数据了！');
    }
  };
}
```

### 更新数据

```javascript
function update() {
  const request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .put({id: 1, name: '张老三', age: 24, email: 'zhangsan@qq.com'});

  request.onsuccess = function (event) {
    console.log('数据更新成功');
  };

  request.onerror = function (event) {
    console.log('数据更新失败');
  }
}
```

### 删除数据

```javascript
function remove() {
  const request = db.transaction(['person'], 'readwrite')
    .objectStore('person')
    .delete(1);

  request.onsuccess = function (event) {
    console.log('数据删除成功');
  };
}
```

### 使用索引

索引的意义在于，可以让你搜索任意字段，也就是说从任意字段拿到数据记录。如果不建立索引，默认只能搜索主键（即从主键取值）

```javascript
function useIndex() {
  const transaction = db.transaction(['person'], 'readonly');
  const objectStore = transaction.objectStore('person');
  const index = objectStore.index('name');
  const request = index.get('李四');

  request.onsuccess = function (e) {
    const result = e.target.result;
    if (result) {
      console.log(result);
    }
  }
}
```

## indexedDB 对象

- `indexedDB.open()`
- `indexedDB.deleteDatabase()`
- `indexedDB.cmp()`，较两个值是否为 indexedDB 的相同的主键

## IDBRequest 对象

`IDBRequest` 对象表示打开的数据库连接，`indexedDB.open()`方法和`indexedDB.deleteDatabase()`方法会返回这个对象。数据库的操作都是通过这个对象完成的

`IDBRequest` 对象有以下属性

- `IDBRequest.readyState`：等于`pending`表示操作正在进行，等于`done`表示操作正在完成。
- `IDBRequest.result`：返回请求的结果。如果请求失败、结果不可用，读取该属性会报错。
- `IDBRequest.error`：请求失败时，返回错误对象。
- `IDBRequest.source`：返回请求的来源（比如索引对象或 ObjectStore）。
- `IDBRequest.transaction`：返回当前请求正在进行的事务，如果不包含事务，返回`null`
- `IDBRequest.onsuccess`：指定success事件的监听函数。
- `IDBRequest.onerror`：指定error事件的监听函数。

`IDBOpenDBRequest` 对象继承了 IDBRequest 对象，提供了两个额外的事件监听属性。

- `IDBOpenDBRequest.onblocked`：指定`blocked`事件（`upgradeneeded`事件触发时，数据库仍然在使用）的监听函数。
- `IDBOpenDBRequest.onupgradeneeded`：`upgradeneeded`事件的监听函数

## IDBDatabase 对象

打开数据成功以后，可以从`IDBOpenDBRequest`对象的`result`属性上面，拿到一个`IDBDatabase`对象，它表示连接的数据库。后面对数据库的操作，都通过这个对象完成

`IDBDatabase` 对象有以下属性

- `IDBDatabase.name`：字符串，数据库名称
- `IDBDatabase.version`：整数，数据库版本。数据库第一次创建时，该属性为空字符串
- `IDBDatabase.objectStoreNames`：DOMStringList 对象（字符串的集合），包含当前数据的所有 object store 的名字
- `IDBDatabase.onabort`：指定 abort 事件（事务中止）的监听函数
- `IDBDatabase.onclose`：指定 close 事件（数据库意外关闭）的监听函数
- `IDBDatabase.onerror`：指定 error 事件（访问数据库失败）的监听函数
- `IDBDatabase.onversionchange`：数据库版本变化时触发（发生`upgradeneeded`事件，或调用`indexedDB.deleteDatabase()`）

`IDBDatabase` 对象有以下方法

- `IDBDatabase.close()`：关闭数据库连接，实际会等所有事务完成后再关闭。
- `IDBDatabase.createObjectStore()`：创建存放数据的对象仓库，类似于传统关系型数据库的表格，返回一个 `IDBObjectStore` 对象。该方法只能在`versionchange`事件监听函数中调用。
- `IDBDatabase.deleteObjectStore()`：删除指定的对象仓库。该方法只能在`versionchange`事件监听函数中调用。
- `IDBDatabase.transaction()`：返回一个 IDBTransaction 事务对象。

## IDBObjectStore 对象

`IDBObjectStore` 对象对应一个对象仓库（object store）。`IDBDatabase.createObjectStore()`方法返回的就是一个 `IDBObjectStore` 对象。

`IDBDatabase` 对象的`transaction()`返回一个事务对象，该对象的`objectStore()`方法返回 `IDBObjectStore` 对象，因此可以采用链式写法

`IDBObjectStore` 对象有以下属性。

- `IDBObjectStore.indexNames`：返回一个类似数组的对象（DOMStringList），包含了当前对象仓库的所有索引。
- `IDBObjectStore.keyPath`：返回当前对象仓库的主键。
- `IDBObjectStore.name`：返回当前对象仓库的名称。
- `IDBObjectStore.transaction`：返回当前对象仓库所属的事务对象。
- `IDBObjectStore.autoIncrement`：布尔值，表示主键是否会自动递增。

`IDBObjectStore` 对象有以下方法。

- `IDBObjectStore.add()`，向对象仓库添加数据
- `IDBObjectStore.put()`，更新某个主键对应的数据记录
- `IDBObjectStore.clear()`，删除当前对象仓库的所有记
- `IDBObjectStore.delete()`，删除指定主键的记录
- `IDBObjectStore.count()`，计算记录的数量
- `IDBObjectStore.getKey()`，获取主键
- `IDBObjectStore.get()`，获取主键对应的数据记录
- `IDBObjectStore.getAll()`，获取对象仓库的记录
- `IDBObjectStore.getAllKeys(query, count)`，获取所有符合条件的主键
- `IDBObjectStore.index()`，返回指定名称的索引对象 IDBIndex
- `IDBObjectStore.createIndex(indexName, keyPath, objectParameters)`，返回指定名称的索引对象 IDBIndex
- `IDBObjectStore.deleteIndex()`
- `IDBObjectStore.openCursor()`，获取一个指针对象
- `IDBObjectStore.openKeyCursor()`，获取一个主键指针对象

## IDBTransaction 对象

`IDBTransaction` 对象用来异步操作数据库事务，所有的读写操作都要通过这个对象进行

`IDBDatabase.transaction()`方法返回的就是一个 `IDBTransaction` 对象

`IDBTransaction` 对象有以下属性

- `IDBTransaction.db`：返回当前事务所在的数据库对象 IDBDatabase。
- `IDBTransaction.error`：返回当前事务的错误。如果事务没有结束，或者事务成功结束，或者被手动终止，该方法返回null。
- `IDBTransaction.mode`：返回当前事务的模式，默认是readonly（只读），另一个值是readwrite。
- `IDBTransaction.objectStoreNames`：返回一个类似数组的对象 DOMStringList，成员是当前事务涉及的对象仓库的名字。
- `IDBTransaction.onabort`：指定abort事件（事务中断）的监听函数。
- `IDBTransaction.oncomplete`：指定complete事件（事务成功）的监听函数。
- `IDBTransaction.onerror`：指定error事件（事务失败）的监听函数。

`IDBTransaction` 对象有以下方法

- `IDBTransaction.abort()`：终止当前事务，回滚所有已经进行的变更。
- `IDBTransaction.objectStore(name)`：返回指定名称的对象仓库 `IDBObjectStore`

## IDBIndex 对象

`IDBIndex` 对象代表数据库的索引，通过这个对象可以获取数据库里面的记录。数据记录的主键默认就是带有索引，`IDBIndex` 对象主要用于通过除主键以外的其他键，建立索引获取对象。

`IDBIndex` 是持久性的键值对存储。只要插入、更新或删除数据记录，引用的对象库中的记录，索引就会自动更新。

`IDBObjectStore.index()`方法可以获取 `IDBIndex` 对象

`IDBIndex` 对象有以下属性。

- `IDBIndex.name`：字符串，索引的名称。
- `IDBIndex.objectStore`：索引所在的对象仓库。
- `IDBIndex.keyPath`：索引的主键。
- `IDBIndex.multiEntry`：布尔值，针对`keyPath`为数组的情况，如果设为true，创建数组时，每个数组成员都会有一个条目，否则每个数组都只有一个条目。
- `IDBIndex.unique`：布尔值，表示创建索引时是否允许相同的主键。

`IDBIndex` 对象有以下方法，它们都是异步的，立即返回的都是一个 `IDBRequest` 对象。

- `IDBIndex.count()`：用来获取记录的数量。它可以接受主键或 `IDBKeyRange` 对象作为参数，这时只返回符合主键的记录数量，否则返回所有记录的数量。
- `IDBIndex.get(key)`：用来获取符合指定主键的数据记录。
- `IDBIndex.getKey(key)`：用来获取指定的主键。
- `IDBIndex.getAll()`：用来获取所有的数据记录。它可以接受两个参数，都是可选的，第一个参数用来指定主键，第二个参数用来指定返回记录的数量。
如果省略这两个参数，则返回所有记录。由于获取成功时，浏览器必须生成所有对象，所以对性能有影响。如果数据集比较大，建议使用 `IDBCursor` 对象。
- `IDBIndex.getAllKeys()`：该方法与`IDBIndex.getAll()`方法相似，区别是获取所有主键。
- `IDBIndex.openCursor()`：用来获取一个 `IDBCursor` 对象，用来遍历索引里面的所有条目。
- `IDBIndex.openKeyCursor()`：该方法与`IDBIndex.openCursor()`方法相似，区别是遍历所有条目的主键

## IDBCursor 对象

`IDBCursor` 对象代表指针对象，用来遍历数据仓库（`IDBObjectStore`）或索引（`IDBIndex`）的记录。

`IDBCurso`r 对象一般通过`IDBObjectStore.openCursor()`方法获得

`IDBCursor` 对象的属性。

- `IDBCursor.source`：返回正在遍历的对象仓库或索引。
- `IDBCursor.direction`：字符串，表示指针遍历的方向。共有四个可能的值：next（从头开始向后遍历）、nextunique（从头开始向后遍历，重复的值只遍历一次）、
prev（从尾部开始向前遍历）、prevunique（从尾部开始向前遍历，重复的值只遍历一次）。
该属性通过`IDBObjectStore.openCursor()`方法的第二个参数指定，一旦指定就不能改变了。
- `IDBCursor.key`：返回当前记录的主键。
- `IDBCursor.value`：返回当前记录的数据值。
- `IDBCursor.primaryKey`：返回当前记录的主键。对于数据仓库（objectStore）来说，这个属性等同于 IDBCursor.key；对于索引，IDBCursor.key 返回索引的位置值，该属性返回数据记录的主键。

`IDBCursor` 对象有如下方法。

- `IDBCursor.advance(n)`：指针向前移动 n 个位置。
- `IDBCursor.continue()`：指针向前移动一个位置。它可以接受一个主键作为参数，这时会跳转到这个主键。
- `IDBCursor.continuePrimaryKey()`：该方法需要两个参数，第一个是key，第二个是`primaryKey`，将指针移到符合这两个参数的位置。
- `IDBCursor.delete()`：用来删除当前位置的记录，返回一个 `IDBRequest` 对象。该方法不会改变指针的位置。
- `IDBCursor.update()`：用来更新当前位置的记录，返回一个 `IDBRequest` 对象。它的参数是要写入数据库的新的值。

## IDBKeyRange 对象

`IDBKeyRange` 对象代表数据仓库（object store）里面的一组主键。根据这组主键，可以获取数据仓库或索引里面的一组记录

`IDBKeyRange` 可以只包含一个值，也可以指定上限和下限。它有四个静态方法，用来指定主键的范围。

- `IDBKeyRange.lowerBound()`：指定下限。
- `IDBKeyRange.upperBound()`：指定上限。
- `IDBKeyRange.bound()`：同时指定上下限。
- `IDBKeyRange.only()`：指定只包含一个值。

与之对应，`IDBKeyRange` 对象有四个只读属性。

- `IDBKeyRange.lower`：返回下限
- `IDBKeyRange.lowerOpen`：布尔值，表示下限是否为开区间（即下限是否排除在范围之外）
- `IDBKeyRange.upper`：返回上限
- `IDBKeyRange.upperOpen`：布尔值，表示上限是否为开区间（即上限是否排除在范围之外）

```javascript
const index = db.transaction(['people'], 'readonly')
  .objectStore('people')
  .index('name');

const range = IDBKeyRange.bound('B', 'D');

range.includes('F') // 查询某个主键是否包含在当前这个主键组之内

index.openCursor(range).onsuccess = function (e) {
  const cursor = e.target.result;
  if (cursor) {
    console.log(cursor.key + ':');
    for (const field in cursor.value) {
      console.log(cursor.value[field]);
    }
    cursor.continue();
  }
}
```
