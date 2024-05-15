## npm run xxx 运行流程

1. 在理解`npm run XXX`之前，我们需要知道`npm install`时会做的一步操作，npm 读到该配置后，就将执行脚本软链接到`./node_modules/.bin`目录下，
而`npm run xxx`还会自动把`node_modules/.bin`加入`$PATH`环境变量中，可以直接作为命令运行依赖程序和开发依赖程序，不用全局安装。
执行结束后，再将`$PATH`变量恢复原样
2. 会去`package.json`的`script`对象中查找到`XXX`，例如在`umi`的项目中执行`npm run start`就会去执行`start`对应的umi脚本`"start":"umi dev"`。
而直接执行`umi dev`这条命令的话系统会报错，因为`umi`不是全局指令。
3. 在执行脚本的时候，系统会默认访问`./node_modules/.bin/`目录中创建好`umi的`几个可执行文件，执行`umi dev`的命令就相当于执行了`./node_modules/.bin/umi dev`

## npm link

如何高效率在本地调试以验证包的可用性呢？

一个“笨”方法是，手动复制粘贴组件并打包产出到业务项目的`node_modules`中进行验证，但是这种做法既不安全也会使得项目混乱，
变得难以维护，同时过于依赖手工执行，这种操作非常原始。 

使用`npm link`。它本质就是软链接，可以将模块链接到对应的业务项目中运行，主要做了两件事：

1. 为目标 npm 模块（npm-package-1）创建软链接，将其链接到全局 node 模块安装路径 `/usr/local/lib/node_modules/`中；
1. 为目标 npm 模块（npm-package-1）的可执行 bin 文件创建软链接，将其链接到全局 node 命令安装路径`/usr/local/bin/`中。

我们来看一个具体场景，假设你正在开发项目 project 1，其中有个包 package 1，对应 npm 模块包名称是 npm-package-1，
我们在 package 1 项目中加入了新功能 feature A，现在要验证在 project 1 项目中能否正常使用 package 1 的 feature A，你应该怎么做？

1. 我们先在 package 1 目录中，执行`npm link`，这样 npm link 通过链接目录和可执行文件，实现npm包命令的全局可执行。
1. 然后在 project 1 中创建链接，执行`npm link npm-package-1`命令时，它就会去`/usr/local/lib/node_modules/`这个路径下寻找是否有这个包，如果有就建立软链接。

这样一来，我们就可以在 project 1 的 node_module 中会看到链接过来的模块包 npm-package-1，此时的 npm-package-1 就带有最新开发的 feature A，
这样一来就可以在 project 1 中正常开发调试 npm-package-1。当然别忘了，调试结束后可以执行***npm unlink***以取消关联。

## npx

### 调用项目安装的模块

npx 想要解决的主要问题，就是调用项目内部安装的模块。比如，项目内部安装了测试工具 typescript

一般来说调用 `tsc`，只能在项目脚本和package.json 的scripts字段里面， 如果想在命令行下调用，必须像下面这样

```shell
# 项目的根目录下执行
node-modules/.bin/tsc --version
```

npx 就是想解决这个问题，让项目内部安装的模块用起来更方便，只要像下面这样调用就行了

```shell
npx tsc --version
```

### 避免全局安装模块

除了调用项目内部模块，npx还能避免全局安装的模块。比如，`create-react-app` 这个模块是全局安装，npx可以运行它，而且不进行全局安装

```shell
npx create-react-app react-demo
```

上面代码运行时，npx将 `create-react-app` 下载到一个临时目录，使用以后再删除。所以，以后再次执行上面的命令，会重新下载 `create-react-app`

下载全局模块时，npx允许指定版本

```shell
npx uglify-js@3.1.0 main.js -o ./dist/main.js
```

上面代码指定使用 3.1.0 版本的uglify-js压缩脚本

注意，只要npx后面的模块无法在本地发现，就会下载同名模块。比如，本地没有安装 `http-server` 模块，下面的命令会自动下载该模块，在当前目录启动一个Web服务

```shell
npx http-server
```

### 执行 GitHub 源码

npx 还可以执行GitHub上面的模块源码。

```shell
# 执行 Gist 代码
npx https://gist.github.com/zkat/4bc19503fe9e9309e2bfaa2c58074d32

# 执行仓库代码
npx github:piuccio/cowsay hello
```

## Corepack

`Corepack`是一个实验性工具，在 `Node.js v16.13` 版本中引入，它可以指定项目使用的包管理器以及版本, 
简单来说，`Corepack` 会成为 Node.js 官方的内置 CLI，用来管理包管理工具（npm、yarn、pnpm、cnpm），用户无需手动安装，即**包管理器的管理器**

主要作用：

- 不再需要专门全局安装 yarn pnpm 等工具
- 可以强制团队项目中使用他特定的包管理器版本，而无需他们在每次需要进行更新时手动同步它，如果不符合配置将在控制台进行错误提示

在项目 package.json 文件中新增属性 `"packageManager"`，代表当前项目只允许使用yarn 包管理器并指定1.22.15版本

```json
{
  "packageManager": "yarn@1.22.15"
}
```

激活corepack

```shell
corepack enable/disable

corepack prepare pnpm@latest --activate
```