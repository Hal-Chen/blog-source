## ['1', '2', '3'].map(parseInt) 输出什么？

::: tip
`parseInt` 是 JavaScript 中的一个全局函数（顶级函数），它会将给定的字符串以指定基数（radix/base）解析成为整数。
```js
parseInt(string, radix)
```
:::

所以它的计算过程其实是

```js
console.log(parseInt("1", 0)); // 1
console.log(parseInt("2", 1)); // NaN
console.log(parseInt("3", 2)); // NaN
```

返回 NaN 的主要有以下几种情况：

- 第一个参数无法被转化成数值类型，`parseInt('abc', 10)`
- 第一个参数，不是 radix 进制下的合法数字，`parseInt('5', 2)`，即二进制最大是1
- radix 不在 [2, 36] 范围内（注意其实 0 也是可以的），`parseInt('5', 2)`

再加一道题，第一个参数如果不是一个字符串，则将其转换为字符串，所以 Infinity 被转换成 "Infinity"，
而 19 进制数中，最大的字符就是 i，代表 18，所以解析的时候遇到 n 就停了，所以输出 18

```js
console.log(parseInt(Infinity, 10))  // NaN
console.log(parseInt(Infinity, 19))  // 18
```

## try...catch中的return

当 `try` 或 `catch` 里有 `return` 时，先执行 `finall` y，再执行 `return` ；且`finally` 中不能修改 `try` 和 `catch` 中变量的值

这个函数的返回值是0，而不是2，实际执行过程是，在执行到 `try` 内的` return result`语句前，
会先将返回值`result` 保存在一个临时变量中，然后才执行 `finally` 语句，最后 `try` 再返回那个临时变量，
`finally` 中对 `result` 的修改不会被返回

```js
const test = () => {
	let result = 0;
	try {
		return result;
	} finally {
		result = 2;
	}
}
console.log(test())  // 0
```

如果在 `finally` 中也有 `return` 语句呢？`try` 和 `catch` 内的 `return`会丢失，
实际会返回 `finally` 中的返回值。`finally`中有`return`不仅会覆盖`try`和`catch`内的返回值，
还会掩盖`try`和`catch`内的异常，就像异常没有发生一样，比如说：

```js
const test = () => {
	let result = 0;
	try {
		return result;
	} finally {
		result = 100
		return 2;
	}
}
console.log(test())  // 2
```

## map和weakMap的区别

- 如果你想要可以获取键的列表，你应该使用 Map 而不是 WeakMap
- 如果你想要作为键的对象可以被垃圾回收，你应该使用 WeakMap

## 如何让 var [a, b] = {a: 1, b: 2} 解构赋值成功

我们知道`for of`只能遍历具有迭代器属性的，在遍历数组的时候会打印出1 2 3，
遍历对象时会报这样的一个错误`TypeError: obj is not iterable`

所以我们为对象打造一个迭代器出来，也就是让对象的隐式原型可以继承到迭代器属性

```javascript
Object.prototype[Symbol.iterator] = function(){
    // 使用 Object.values(this) 方法获取对象的所有值，并返回这些值的迭代器对象
    return Object.values(this)[Symbol.iterator]()
}
```

## [9, 8, 7, 6][1, 2, 3]结果

首先 [9,8,7,6] 是一个一维数组，后面的元素 [1,2] 不能作为数组执行，它将作为数组下标进行处理。

在下标的上下文中，[1,2]是一个以逗号（,）分隔的单一表达式。

在 MDN 的定义中，逗号（,）运算符对它的每个操作数从左到右求值，并返回最后一个操作数的值。

```javascript
const arr = (1, 2, 3, 4, 5);
console.log(arr); // 输出 5

[9, 8, 7, 6][1,2,3]        // 输出 6
[9, 8, 7, 6][8, 2, 3, 1]   // 输出 8
```





