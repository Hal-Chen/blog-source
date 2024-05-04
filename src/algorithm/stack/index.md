## leetcode-20-有效的括号

```js
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
    let arr = [];
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (['{', '[', '('].includes(c)) {
            arr.push(c);
        } else {
            if (arr.length === 0) return false;
            const last = arr.pop();
            if (c === ')' && last !== '(') return false;
            if (c === ']' && last !== '[') return false;
            if (c === '}' && last !== '{') return false;
        }
    }
    return arr.length === 0;
};
```
