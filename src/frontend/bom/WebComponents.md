# Web Components入门实例教程

## 用户卡片实例

我们不希望用户能够看到`<user-card>`的内部代码，Web Component 允许内部代码隐藏起来，这叫做 Shadow DOM，即这部分 DOM 默认与外部 DOM 隔离，内部任何代码都无法影响外部。

自定义元素的`this.attachShadow()`方法开启 Shadow DOM

`this.attachShadow()`方法的参数`{ mode: 'closed' }`，表示 `Shadow DOM` 是封闭的，不允许外部访问

```javascript
class UserCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'closed'})

    const templateElem = document.getElementById('userCardTemplate');
    const content = templateElem.content.cloneNode(true);

    content.querySelector('img').setAttribute('src', this.getAttribute('image'));
    content.querySelector('.container>.name').innerText = this.getAttribute('name');
    content.querySelector('.container>.email').innerText = this.getAttribute('email');

    shadow.appendChild(content);

    this.$button = shadow.querySelector('button');
    this.$button.addEventListener('click', () => {
      console.log('关注');
    });
  }
}

window.customElements.define('user-card', UserCard);
```

根据规范，自定义元素的名称必须包含连词线，用与区别原生的 HTML 元素。所以，`<user-card>`不能写成`<usercard>`

`<template>`样式里面的 `:host` 伪类，指代自定义元素本身

```html
<user-card
        image="https://semantic-ui.com/images/avatar2/large/kristy.png"
        name="User Name"
        email="yourmail@some-email.com"
/>

<template id="userCardTemplate">
    <style>
        :host {
            display: flex;
            align-items: center;
            width: 450px;
            height: 180px;
            background-color: #d4d4d4;
            border: 1px solid #d5d5d5;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            overflow: hidden;
            padding: 10px;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        .image {
            flex: 0 0 auto;
            width: 160px;
            height: 160px;
            vertical-align: middle;
            border-radius: 5px;
        }

        .container {
            box-sizing: border-box;
            padding: 20px;
            height: 160px;
        }

        .container > .name {
            font-size: 20px;
            font-weight: 600;
            line-height: 1;
            margin: 0 0 5px;
        }

        .container > .email {
            font-size: 12px;
            opacity: 0.75;
            line-height: 1;
            margin: 0 0 15px;
        }

        .container > .button {
            padding: 10px 25px;
            font-size: 12px;
            border-radius: 5px;
            text-transform: uppercase;
        }
    </style>

    <img class="image">
    <div class="container">
        <p class="name"></p>
        <p class="email"></p>
        <button class="button">Follow</button>
    </div>
</template>
```

## 元素注册

```javascript
customElements.define(name, constructor, options);

customElements.get(name); // 返回指定自定义元素的构造函数，如果未定义自定义元素，则返回undefined

customElements.upgrade(root); // 更新节点子树中所有包含阴影的自定义元素

customElements.whenDefined(name); // 当使用给定名称定义自定义元素时将会执行的回调

// 判断元素是否注册
if (!customElements.get('user-card')) {
  customElements.define('user-card', UserCard);
}
```

## 生命周期

自定义元素有四个生命周期

- `connectedCallback`: 当自定义元素第一次被连接到文档 DOM 时被调用。
- `disconnectedCallback`: 当自定义元素与文档 DOM 断开连接时被调用。
- `adoptedCallback`: 当自定义元素被移动到新文档时被调用。
- `attributeChangedCallback`: 当自定义元素的一个属性被增加、移除或更改时被调用

```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super()
    // 下面可以写功能代码
  }

  connectedCallback() {}

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback() {}
}
```

## Shadow DOM - 影子DOM

`Shadow DOM`可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁

- `Shadow host`：一个常规 DOM节点，Shadow DOM 会被附加到这个节点上
- `Shadow tree`：Shadow DOM内部的DOM树
- `Shadow boundary`：Shadow DOM结束的地方，也是常规 DOM开始的地方
- `Shadow root`: Shadow tree的根节点

我们可以使用 `Element.attachShadow()` 方法来将一个 `shadow root` 附加到任何一个元素上。它接受一个配置对象作为参数，该对象有一个 `mode` 属性，值可以是 `open` 或者 `closed`

## 选择器

- `:defined`: 匹配任何已定义的元素，包括内置元素和使用`CustomElementRegistry.define()`定义的自定义元素
- `:host`:   选择当前的自定义元素
- `:host()`: 选择 shadow DOM的shadow host，()里的内容是它内部使用的CSS（这样您可以从 shadow DOM 内部选择自定义元素）— 但只匹配给定方法的选择器的 shadow host 元素。
例如：:host(name="hello")。
- `:host-context()`: 选择 shadow DOM的 shadow host ，内容是它内部使用的CSS（这样您可以从 shadow DOM 内部选择自定义元素）— 但只匹配给定方法的选择器匹配元素的子 shadow host 元素
