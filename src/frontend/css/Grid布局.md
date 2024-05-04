# Grid 网格布局

## 属性

容器属性

- display
- grid-template-columns、grid-template-rows
- row-gap、column-gap、gap
- grid-template-areas
- grid-auto-flow
- justify-items、align-items、place-items
- justify-content、align-content、place-content
- grid-auto-columns、grid-auto-rows

项目属性

- grid-column-start、grid-column-end、grid-row-start、grid-row-end
- grid-column、grid-row
- grid-area
- justify-self、align-self、 place-self

## display

```css
div {
  display: grid;
  display: inline-grid;
}
```

## grid-template-columns、grid-template-rows

容器指定了网格布局以后，接着就要划分行和列；`grid-template-columns` 属性定义每一列的列宽

```css
.container {
  display: grid;
  /* 3行3列 */
  grid-template-columns: 100px 100px 100px;  
  grid-template-rows: 100px 100px 100px;
  
  grid-template-columns: 33.33% 33.33% 33.33%;  /* 使用百分比 */

  grid-template-columns: repeat(3, 33.33%);  /* 使用repeat简化，效果同上 */
  grid-template-columns: repeat(2, 100px 20px 80px); /* 生成6列 */
  grid-template-columns: repeat(auto-fill, 100px); /* 列宽100px，能放多少放多少 */

  grid-template-columns: 1fr 1fr;   /* 等宽的两列 */
  grid-template-columns: 150px 1fr 2fr;
  grid-template-columns: 1fr 1fr minmax(100px, 1fr); /* 列宽不小于100px，不大于1fr */

  grid-template-columns: 100px auto 100px;

  /* 使用方括号，指定每一根网格线的名字 */
  /* 允许同一根线有多个名字，比如[fifth-line row-5] */
  grid-template-columns: [c1] 100px [c2] 100px [c3] auto [c4];  
}
```

## row-gap、column-gap、gap

```css
.container {
  row-gap: 20px;
  column-gap: 40px;

  /* 简写 gap: <row-gap> <column-gap>; */
  gap: 20px 40px;
}
```

## grid-template-areas

网格布局允许指定"区域"（area），一个区域由单个或多个单元格组成。`grid-template-areas`属性用于定义区域

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  
  grid-template-areas: 'a b c'
                       'd e f'
                       'g h i';
  
  grid-template-areas: "header header header"
                       "main main sidebar"
                       "footer footer footer";


  /* 如果某些区域不需要利用，则使用"点"（.）表示，
  表示没有用到该单元格，或者该单元格不属于任何区域 */
  grid-template-areas: 'a . c'
                       'd . f'
                       'g . i';
}
```

## grid-auto-flow

划分网格以后，容器的子元素会按照顺序，自动放置在每一个网格。默认的放置顺序是"先行后列"，即先填满第一行，再开始放入第二行

这个顺序由`grid-auto-flow`属性决定，默认值是row，即"先行后列"。也可以将它设成column，变成"先列后行"

row dense，表示"先行后列"，并且尽可能紧密填满，尽量不出现空位

```
grid-auto-flow: column;

grid-auto-flow: column dense;
```

## justify-items、align-items、place-items

设置**单元格内容**的水平垂直位置

```css
.container {
  justify-items: start;
}
```

`place-items`属性是 `align-items` 属性和 `justify-items` 属性的合并简写形式

```
place-items: <align-items> <justify-items>;
```

## justify-content、align-content、place-content

设置整个内容区域在容器里面的水平垂直位置

## grid-auto-columns、grid-auto-rows

有时候，一些项目的指定位置，在现有网格的外部。比如网格只有3列，但是某一个项目指定在第5行。这时，浏览器会自动生成多余的网格，以便放置项目

`grid-auto-columns`属性和`grid-auto-rows`属性用来设置，浏览器自动创建的多余网格的列宽和行高。
它们的写法与`grid-template-columns`和`grid-template-rows`完全相同。
如果不指定这两个属性，浏览器完全根据单元格内容的大小，决定新增网格的列宽和行高

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  
  /* 指定新增的行高统一为50px（原始的行高为100px） */
  grid-auto-rows: 50px; 
}
```

## grid-column-start、grid-column-end

```css
.item-1 {
  /* 1号项目的左边框是第二根垂直网格线，右边框是第四根垂直网格线 */
  grid-column-start: 2;
  grid-column-end: 4;

  /* 还可以指定网格线的名字 */
  grid-column-start: header-start;
  grid-column-end: header-end;

  /* 表示横跨2列 */
  grid-column-start: span 2;
}
```

## grid-column、grid-row

`grid-column`属性是 `grid-column-start` 和 `grid-column-end` 的合并简写形式

`grid-row` 属性是 `grid-row-start` 属性和 `grid-row-end`的合并简写形式

```css
.item-1 {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

/* 等同于 */

.item-1 {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
}
```

也可以使用span关键字，表示跨越多少个网格

```css
.item-1 {
  background: #b03532;
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

/* 等同于 */

.item-1 {
  background: #b03532;
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
}
```

## grid-area

`grid-area` 属性指定项目放在哪一个区域

```css
.item-1 {
  grid-area: e;
}
```

`grid-area` 属性还可用作`grid-row-start`、`grid-column-start`、`grid-row-end`、`grid-column-end`的合并简写形式，直接指定项目的位置

```
.item {
  grid-area: <row-start> / <column-start> / <row-end> / <column-end>;
}
```

## justify-self、align-self、 place-self

```
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  
  place-self: <align-self> <justify-self>;
}
```
