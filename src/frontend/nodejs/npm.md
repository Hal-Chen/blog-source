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

## npx的作用

npx 执行「npm execute」npm包的二进制文件， npx由***npm v5.2***版本引入，解决了npm的一些使用快速开发、调试，以及项目内使用全局模块的痛点。
在传统npm模式下，如果我们需要使用代码检测工具ESLint，就要先通过npm install安装：

```shell
npm install eslint --save-dev
./node_modules/.bin/eslint --init
./node_modules/.bin/eslint yourfile.js

# 而使用npx就简单多了，你只需要下面2个操作步骤：
npx eslint --init
npx eslint yourfile.js
```

为什么 npx 操作起来如此便捷呢？

这是因为它可以直接执行`node_modules/.bin`文件夹下的文件。在运行命令时，`npx`可以自动去`node_modules/.bin`路径和环境变量`$PATH`里面检查命令是否存在，
而不需要再在`package.json`中定义相关的 `script`。

npx 另一个更实用的好处是：npx 执行模块时会优先安装依赖，但是在安装执行后便删除此依赖，这就避免了全局安装模块带来的问题。
运行如下命令后，`npx`会将`create-react-app`下载到一个临时目录，使用以后再删除：

```shell
npx create-react-app cra-project
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