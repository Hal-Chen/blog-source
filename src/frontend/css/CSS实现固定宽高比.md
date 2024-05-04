## 可替换元素

可替换元素(如`<img>`、`<video>`)和其他元素不同，它们本身有像素宽度和高度的概念。所以如果想实现这一类元素固定宽高比，就比较简单。

我们可以指定其宽度或者高度值，另一边自动计算就可以了。 如下，我们固定图片元素的宽度，高度自适应：

```html
<div class="wrapper">
    <img src="xxx.jpg" alt="img">
</div>
<style>
    .wrapper {
        width: 50vw;
        margin: 100px auto;
        padding: 10px;
        border: 5px solid lightsalmon;
        font-size: 0;
    }
    img { width: 100%; height: auto;}
</style>
```

## 普通元素

`padding-top` 和 `padding-bottom` 使用百分比做单位时，是基于父级盒子的宽度来计算的

```html
<div class="wrapper">
    <div class="box"></div>
</div>
<style>
    .wrapper { width: 40vw; }
    .box {
        width: 100%;
        height: 0;
        padding-top: 100%;
        background-color: lightsalmon;
    }
</style>
```

## aspect-ratio属性

```css
.box1 {
    width: 160px;
    height: auto;
    aspect-ratio: 16 / 9;
}
.box2 {
    width: auto;
    height: 90px;
    aspect-ratio: 16 / 9;
}
```

虽然浏览器已经逐步支持了，但是支持度尚欠缺，如果想尝试使用的话，可以尝试下面的兼容性写法：

```css
.box {
    width: 400px;
    aspect-ratio: 1 / 1;
    background-color: red;
}
@supports not(aspect-ratio: 1 / 1) {
    .box {
        width: 400px;
        height: 400px;
        background: green;
    }
}
```

## object-fit

CSS3 的 `object-fit` 属性是用来指定 **可替换元素** 的内容是如何适应到容器中的。
它的值有 5 种。分别为：`fill` | `contain` | `cover` | `none` | `scale-down`

- `fill`：会充满整个容器，不考虑宽高比，所以会被拉伸变形
- `contain`：会缩放到容器内，保持宽高比
- `cover`：会保持比例进行缩放，内容的尺寸一定会大于等于容器，然后进行裁剪
- `none`：保持图片的原始尺寸
- `scale-down`：会在 `none` 或 `contain` 中选择一个，原则是：当容器小时，
 它的表现和 `contain` 一样；当图片小时，它的表现和 `none` 一样。即谁小选择谁。

### object-position

在CSS中，我们可以使用 background-size 和background-position属性为背景图像设置大小和位置。

而 `object-fit` 和 `object-position` 属性则允许我们对嵌入的图像（以及其他替代元素，如视频）做类似的操作

```css
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right bottom; /* or 100% 100% */
}
```


