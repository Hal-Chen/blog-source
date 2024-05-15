# Node.js 命令行程序开发

## 可执行脚本

首先创建 `my-package` 文件夹，在src新建 `hello.js`

```
#!/usr/bin/env node
console.log('hello world');

module.exports = {
    name: 'world',
    age: 12
}
```

然后给文件添加权限，`chmod 777 ./src/hello.js`

```json
{
  "name": "my-package",
  "bin": {
    "hello": "./src/hello.js"
  },
  "main": "./src/hello.js"
}
```

调用

```shell
sudo npm link   # 在my-package目录下执行，链接到全局，然后就可以执行 hello 命令

npm link my-package  # 其他项目下执行，调用这个库
npm unlink my-package  # 其他项目下执行，解除链接这个库

sudo npm rm --global my-package  # 删除全局包
```

## 命令行参数的原始写法

命令行参数可以用系统变量 `process.argv` 获取

```javascript
#!/usr/bin/env node

console.log(process.argv);
```

执行 `hello`， 会输出 `['/usr/local/bin/node', '/usr/local/bin/hello', '123']`

## 新建进程

脚本可以通过 `child_process` 模块新建子进程，从而执行 Unix 系统命令

```javascript
#!/usr/bin/env node

const name = process.argv[2];
const exec = require('child_process').exec;

const child = exec('echo hello ' + name, function(err, stdout, stderr) {
  if (err) throw err;
  console.log(stdout);
});
```

## shelljs 模块

`shelljs` 模块重新包装了 child_process，调用系统命令更加方便。它需要安装后使用

```shell
npm install --save shelljs
```

然后，改写脚本

```javascript
const name = process.argv[2];
const shell = require("shelljs");

shell.exec("echo hello " + name);
```

上面代码是 shelljs 的本地模式，即通过 exec 方法执行 shell 命令。此外还有全局模式，允许直接在脚本中写 shell 命令

```javascript
require('shelljs/global');

if (!which('git')) {
  echo('Sorry, this script requires git');
  exit(1);
}

mkdir('-p', 'out/Release');
cp('-R', 'stuff/*', 'out/Release');

cd('lib');
ls('*.js').forEach(function(file) {
  sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
  sed('-i', /.*REMOVE_THIS_LINE.*\n/, '', file);
  sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, cat('macro.js'), file);
});
cd('..');

if (exec('git commit -am "Auto-commit"').code !== 0) {
  echo('Error: Git commit failed');
  exit(1);
}
```

## yargs 模块

shelljs 只解决了如何调用 shell 命令，而 yargs 模块能够解决如何处理命令行参数。它也需要安装

```shell
npm install --save yargs
```

yargs 模块提供 argv 对象，用来读取命令行参数。请看改写后的 hello 

```javascript
const argv = require('yargs').argv;

console.log('hello ', argv.name);
```

使用时，下面两种用法都可以

```shell
$ hello --name=tom

$ hello --name tom
```

也就是说，process.argv 的原始返回值如下

```shell
$ node hello --name=tom
[ 'node', '/path/to/myscript.js', '--name=tom' ]
```

yargs 可以上面的结果改为一个对象，每个参数项就是一个键值对

```javascript
const argv = require('yargs').argv;

// $ node hello --name=tom
// argv = {
//   name: tom
// };
```

如果将 argv.name 改成 argv.n，就可以使用一个字母的短参数形式了

```shell
$ hello -n tom
hello tom
```

可以使用 alias 方法，指定 name 是 n 的别名

```javascript
const argv = require('yargs').alias('n', 'name').argv;

console.log('hello ', argv.n);
```

这样一来，短参数和长参数就都可以使用了

```shell
hello -n tom

hello --name tom
```

argv 对象有一个下划线（_）属性，可以获取非连词线开头的参数

```javascript
const argv = require('yargs').argv;

console.log('hello ', argv.n);
console.log(argv._);
```

用法如下

```shell
hello A -n tom B C
hello  tom
[ 'A', 'B', 'C' ]
```

## 命令行参数的配置

yargs 模块还提供3个方法，用来配置命令行参数

- `demand`：是否必选
- `default`：默认值
- `describe`：提示

```javascript
const argv = require('yargs')
  .demand(['n'])
  .default({n: 'tom'})
  .describe({n: 'your name'})
  .argv;

console.log('hello ', argv.n);
```

上面代码指定 n 参数不可省略，默认值为 tom，并给出一行提示。

options 方法允许将所有这些配置写进一个对象

```javascript
const argv = require('yargs')
  .option('n', {
    alias : 'name',
    demand: true,
    default: 'tom',
    describe: 'your name',
    type: 'string'
  })
  .argv;

console.log('hello ', argv.n);
```

有时，某些参数不需要值，只起到一个开关作用，这时可以用 boolean 方法指定这些参数返回布尔值

```javascript
const argv = require('yargs')
  .boolean(['n'])
  .argv;

console.log('hello ', argv.n);
```

上面代码中，参数 n 总是返回一个布尔值，用法如下

```shell
$ hello
hello  false

$ hello -n
hello  true

$ hello -n tom
hello  true
```

boolean 方法也可以作为属性，写入 option 对象

```javascript
const argv = require('yargs')
  .option('n', {
    boolean: true
  })
  .argv;

console.log('hello ', argv.n);
```

## 帮助信息

yargs 模块提供以下方法，生成帮助信息

- `usage`：用法格式
- `example`：提供例子
- `help`：显示帮助信息
- `epilog`：出现在帮助信息的结尾

```javascript
const argv = require('yargs')
  .option('f', {
    alias : 'name',
    demand: true,
    default: 'tom',
    describe: 'your name',
    type: 'string'
  })
  .usage('Usage: hello [options]')
  .example('hello -n tom', 'say hello to Tom')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2015')
  .argv;

console.log('hello ', argv.n);
```

执行结果如下

```shell
hello -h

Usage: hello [options]

Options:
  -f, --name  your name [string] [required] [default: "tom"]
  -h, --help  Show help [boolean]

Examples:
  hello -n tom  say hello to Tom

copyright 2015
```

## 子命令

yargs 模块还允许通过 command 方法，设置 Git 风格的子命令

```javascript
const argv = require('yargs')
  .command("morning", "good morning", function (yargs) {
    console.log("Good Morning");
  })
  .command("evening", "good evening", function (yargs) {
    console.log("Good Evening");
  })
  .argv;

console.log('hello ', argv.n);
```

用法如下

```shell
hello morning -n tom
Good Morning
hello tom
```

可以将这个功能与 shelljs 模块结合起来

````javascript
require('shelljs/global');
const argv = require('yargs')
  .command("morning", "good morning", function (yargs) {
    echo("Good Morning");
  })
  .command("evening", "good evening", function (yargs) {
    echo("Good Evening");
  })
  .argv;

console.log('hello ', argv.n);
````

每个子命令往往有自己的参数，这时就需要在回调函数中单独指定。回调函数中，要先用 reset 方法重置 yargs 对象

```javascript
require('shelljs/global');
const argv = require('yargs')
  .command("morning", "good morning", function (yargs) {  
    echo("Good Morning");
    var argv = yargs.reset()
      .option("m", {
        alias: "message",
        description: "provide any sentence"
      })
      .help("h")
      .alias("h", "help")
      .argv;

    echo(argv.m);
  })
  .argv;
```

用法如下

```shell
$ hello morning -m "Are you hungry?"
Good Morning
Are you hungry?
```

## 其他事项

- 返回值：根据 Unix 传统，程序执行成功返回 0，否则返回 1

```javascript
if (err) {
  process.exit(1);
} else {
  process.exit(0);
}
```

- 重定向：Unix 允许程序之间使用管道重定向数据

```shell
ps aux | grep 'node'
```

脚本可以通过监听标准输入的data 事件，获取重定向的数据

```javascript
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  process.stdout.write(data);
});
```

下面是用法

```shell
$ echo 'foo' | ./hello
hello foo
```

- 系统信号：操作系统可以向执行中的进程发送信号，process 对象能够监听信号事件

```shell
process.on('SIGINT', function () {
  console.log('Got a SIGINT');
  process.exit(0);
});
```

发送信号的方法如下

```shell
$ kill -s SIGINT [process_id]
```
