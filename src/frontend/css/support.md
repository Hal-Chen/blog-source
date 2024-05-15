## 语法

**`@support`** 允许我们在应用样式块之前，测试浏览器是否支持特定的属性：值组合

```css
@supports (display: grid) {
  .wrapper {
    display: grid;
  }
}

@supports not (display: grid) {  }

@supports (display: grid) and (-webkit-display: grid) {  }

@supports (display: grid) or (-webkit-display: grid ) {  }
```

## JS支持

```javascript
if (window.CSS && window.CSS.supports) {}

let supportsGrid = CSS.supports("display", "grid");
let supportsGrid = CSS.supports("(display: grid)");
```

## 案列

支持CSS变量，设置背景色为蓝色

```css
.box {
  background-color: red;
}

@supports (--css: variables) {
  .box {
    --bg-color: blue;
    background-color: var(--bg-color, #00F);
  }
}
```
