﻿# node.js笔记

标签（空格分隔）： 笔记整理

---

在此输入正文

# 搭建基础
## nvm node版本管理工具
```javascript
    nvm use 4.4.0
    npm install gulp-cli -g
    
    nvm list available 有效的node版本
    
    nvm install latest
    
    nvm instal  版本号
    
    nvm install stable
    
    nvm install stable defalut
```

## 权限问题

在Linux系统下，使用NodeJS监听80或443端口提供HTTP(S)服务时需要root权限
需要 sudo node server.js


## 模块
1.核心模块 node运行前加载 存储在内存中
2.文件模块 用户编写的js模块 或者node模块(二进制)

所有模块在执行过程中只初始化一次

## 模块路径解析规则
1.内置模块 如果传递给require函数的是NodeJS内置模块名称，不做路径解析，直接返回内部模块的导出对象，例如require('fs')。
2.假设执行/home/user/hello.js时 require('foo/bar'),会尝试以下路径
```javascript
    '/home/user/node_modules/foo/bar'
    'home/node_modules/foo/bar'
    'node_modules/foo/bar'
```
3.设定NODE_PATH环境变量
NodeJS允许通过NODE_PATH环境变量来指定额外的模块搜索路径
```javascript
    // 注意 多个路径linix 下用 ：分隔 windows下则使用;
    NODE_PATH=/home/user/lib:/home/lib
```
从项目的根位置递归搜寻 node_modules 目录，直到文件系统根目录的 node_modules，如果还没有查找到指定模块的话，就会去 NODE_PATH中注册的路径中查找。

## 包(package)
由多个子模块组成的大模块称做包，并把所有子模块放在同一个目录里。
```javascript
// cat 为一个模块 main.js作为入口文件 
- /home/user/lib/
    - cat/
        head.js
        body.js
        main.js
// require('/home/user/lib/cat/main')
```
但是将main入口文件名出现在路径中并不是很简洁
当加载模块的名字是index.js时可以省略 require('/home/user/lib/cat/index') 等价于 require('/home/user/lib/cat');
所以简化的方式就是 创建一个index.js

package.json可以自定义入口模块的文件名和存放位置
```javascript
    // package.json
    {
        "name": "cat",
        "main": "./lib/main.js"
    }
    
    // 目录结构
    - /home/user/lib/
    - cat/
        + doc/
        - lib/
            head.js
            body.js
            main.js
        + tests/
        package.json
```
如此一来，就同样可以使用require('/home/user/lib/cat')的方式加载模块。NodeJS会根据包目录下的package.json找到入口模块所在位置
## 命令行程序
在Windows下依赖的是.cmd文件
假设当前脚本路径A:\github\nodejs\node-echo.js
那么在当前目录新建一个cmd文件，内容为
```cmd
    @node "A:\github\nodejs\node-echo.js" %*
```
然后环境配置中指定A:\github\nodejs, 完成后就可以在任意位置执行node-echo命令
在Linux下则可以把js当作shell脚本运行
1.js文件开头加上 #! /usr/bin/env node 标记脚本解析器
2.然后赋予node-echo.js文件执行权限
```javascript
    $ chmod +x A:\github\nodejs\node-echo.js
```
3.最后在PATH环境变量指定的某个目录下,如/usr/local/bin下边创建一个软链文件，文件名与我们希望使用的终端命令同名，命令如下：
```javascript
    $ sudo ln -s A:\github\nodejs\node-echo.js /usr/local/bin/node-echo
```
## 工程目录
```
- /home/user/workspace/node-echo/   # 工程目录
    - bin/                          # 存放命令行相关代码
        node-echo
    + doc/                          # 存放文档
    - lib/                          # 存放API相关代码
        echo.js
    - node_modules/                 # 存放三方包
        + argv/
    + tests/                        # 存放测试用例
    package.json                    # 元数据文件
    README.md                       # 说明文件
```
## NPM
版本号 语义版本号分为X.Y.Z三位，分别代表主版本号、次版本号和补丁版本号。当代码变更时，版本号按以下原则更新。
+ 如果只是修复bug，需要更新Z位。
+ 如果是新增了功能，但是向下兼容，需要更新Y位。
+ 如果有大变动，向下不兼容，需要更新X位。

# 文件操作
## 拷贝
### 小文件拷贝
```javascript
    var fs = require('fs');
    
    function copy(src, dst) { // 读取和写入
        fs.writeFileSync(dst, fs.readFileSync(src));
    }
    
    function main(argv) {
        copy(argv[0], argv[1]);
    }
    
    main(process.argv.slice(2));
```
### 大文件拷贝
像之前那样一次性从磁盘读取到内存,再从内存写入磁盘,如果文件过大，内存会被撑满
```javascript
    var fs = require('fs');
    
    function copy(src, dst) {
        fs.createReadStream(src).pipe(fs.createWriteStream(dst));
    }
    
    function main(argv) {
        copy(argv[0], argv[1]);
    }
    
    main(process.argv.slice(2));
```
createReadStream创建只读数据流，createWriteStream创建只写数据流, pipe()连接起来
## API
### Buffer(数据块/缓冲器)
JS语言本身没有二进制数据， Node提供Buffer构造函数操作二进制数据
#### buffer创建
```javascript
    let buf = new Buffer([0x92, 0x21, 0x21]) // 每个字节用16进制表示
    let buf = new Buffer('hello', 'utf-8') // 也可以通过字符串转换创建
    let buf = new Buffer(5) // 声明长度为5的buffer
    
    // 也可以直接修改某个字节
    buf[0] = 0x99
    
    let str = buf.toString('utf-8) // 转换为字符串
```
slice方法的问题
与字符串不同的时字符串修改返回的是新的字符串, buffer修改则是修改本身
```javascript
    let buf = new Buffer([0x92, 0x21, 0x21, 0x44])
    let buf1 = buf.slice(2)
    let buf1[0] = 0x99
    console.log(buf, buf1)
    // <Buffer 0x92, 0x21, 0x99, 0x44 >
    // <Buffer 0x99, 0x44 >
    // slice像是返回了指向原Buffer中间的某个位置的指针
```
#### buffer复制
声明一个新的buffer, 调用buffer.copy
```javascript
    let bin = new Buffer([0x92, 0x21, 0x21, 0x44])
    let newBin = new Buffer(bin.length)
    bin.copy(newBin)
```
### stream(数据流)
对二进制数据的抽象，可以读取/生成 一部分  的同时 写入/处理 一部分
流的类型:
    1. Readable - 可读的流 (例如 fs.createReadStream())
    2. Writable - 可写的流 (例如 fs.createWriteStream())
    3. Duplex - 可读写的流 (例如 net.Socket).
    4. Tansform - 在读写过程中可以修改和变换数据的 Duplex 流 (例如 zlib.createDeflate())
```javascript
    var rs = fs.createReadStream(pathname);

    rs.on('data', function (chunk) {
        doSomething(chunk);
    });
    
    rs.on('end', function () {
        cleanUp();
    });
```
上边的代码中data事件会源源不断地被触发，不管doSomething函数是否处理得过来。代码可以继续做如下改造，以解决这个问题。
```javascript
    var rs = fs.createReadStream(src);

    rs.on('data', function (chunk) {
        rs.pause();
        doSomething(chunk, function () {
            rs.resume();
        });
    });
    
    rs.on('end', function () {
        cleanUp();
    });
```
此外，我们也可以为数据目标创建一个只写数据流，示例如下：
```javascript
    var rs = fs.createReadStream(src);
    var ws = fs.createWriteStream(dst);
    
    rs.on('data', function (chunk) {
        ws.write(chunk);
    });
    
    rs.on('end', function () {
        ws.end();
    });
```
当然，如果写入速度跟不上读取速度依然会爆仓
改进如下:
```javascript
    var rs = fs.createReadStream(src)
    var ws = fs.createWriteStream(dst)
    rs.on('data', function (chunk) {
        if (ws.write(chunk)  === false) {
            rs.pause()
        }
    })
    rs.on('end', function() {
        ws.end()
    })
    rs.on('drain', function() {
        rs.resume()
    })
```
### File System(文件系统)
fs模块API基本可分为三类
1 . 文件属性读写。

其中常用的有fs.stat、fs.chmod、fs.chown等等。

2 . 文件内容读写。

其中常用的有fs.readFile、fs.readdir、fs.writeFile、fs.mkdir等等。

3 . 底层文件操作。

其中常用的有fs.open、fs.read、fs.write、fs.close等等。

异步IO在fs模块的体现, 读写文件的操作都在回调里完成
以fs.readFile为例
```javascript
    fs.readFile(pathname, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            // deal with data
        }
    })
```
此外，fs模块的所有异步API都有对应的同步版本，用于无法使用异步操作时，或者同步操作更方便时的情况。
同步API除了方法名的末尾多了一个Sync之外，异常对象与执行结果的传递方式也有相应变化.
```javascript
  try {
    let data = fs.readFileSync(pathname)
    // deal with data
  } catch (err) {
    console.log(err)
  }
```
### Path(路径)
1.path.normalize
用于标准化路径
具体讲的话，除了解析路径中的.与..外，还能去掉多余的斜杠
```javascript

  var cache = {}

  function store(key, value) {
      cache[path.normalize(key)] = value
  }

  store('foo/bar', 1)
  store('foo//baz//../bar', 2)
  console.log(cache);  // => { "foo/bar": 2 }
```
**注意**：normalize后Windows默认是用'\' 而 Linux 是 '/' 如果需要在任何系统都使用'/' 需要替换一下path.match(/\\/g, '/')
2.path.join
将传入的多个路径拼接为标准路径。该方法可避免手工拼接路径字符串的繁琐，并且能在不同系统下正确使用相应的路径分隔符。以下是一个例子
```javascript
  path.join('foo/', 'baz/', '../bar'); // => "foo/bar"
```
3.path.extname
当我们需要根据不同文件扩展名做不同操作时，该方法就显得很好用。以下是一个例子：
```javascript
  path.extname('foo/bar.js'); // => ".js"
```
## 遍历目录
### 递归算法

目录是一个树状结构，在遍历时一般使用**深度优先**+**先序遍历**算法。深度优先，意味着到达一个节点后，首先接着遍历子节点而不是邻居节点。先序遍历，意味着首次到达了某节点就算遍历完成，而不是最后一次返回某节点才算数。因此使用这种遍历方式时，下边这棵树的遍历顺序是**A > B > D > E > C > F**。

```javascript
          A
         / \
        B   C
       / \   \
      D   E   F
```

**注意**： 使用递归算法编写的代码虽然简洁，但由于每递归一次就产生一次函数调用，在需要优先考虑性能时，需要把递归算法转换为循环算法，以减少函数调用次数。

### 同步遍历
```javascript
    let fs = require('fs')
    let path  = require('path')
    function travel(dir, callback) {
      fs.readdirSync(dir).forEach((file) => {
        let pathname = path.join(dir, file)
        if (fs.statSync(pathname).isDirectory()) {
          travel(pathname, callback)
        } else {
          callback(pathname)
        }
      })
    }
    travel('./', (file) => {
      console.log(file)
    })
```
### 异步遍历
```javascript
    function travel(dir, callback, finish) {
        fs.readdir(dir, function (err, files) {
            (function next(i) {  // 不能像同步的时候用forEach循环
                if (i < files.length) {
                    var pathname = path.join(dir, files[i]);
    
                    fs.stat(pathname, function (err, stats) {
                        if (stats.isDirectory()) {
                            travel(pathname, callback, function () {
                                next(i + 1); // 用于外层next跳到下一个
                            });
                        } else {
                            callback(pathname, function () {
                                next(i + 1); //  callback操作完成后再下一个文件
                            });
                        }
                    });
                } else {
                    finish && finish();
                }
            }(0));
        });
    }
```
## 文本编码
### BOM(Byte Order Mark)移除
BOM用于标记一个文本文件使用Unicode编码，其本身是一个Unicode字符（"\uFEFF"），位于文本文件头部。在不同的Unicode编码下，BOM字符对应的二进制字节如下：
```javascript
        Bytes      Encoding
    ----------------------------
        FE FF       UTF16BE
        FF FE       UTF16LE
        EF BB BF    UTF8
```
虽然BOM起到标记文本编码的作用，但它本身并不属于文件的一部分，有时候文件合并的时候，编码的标记可能造成不正确的输出
去除BOM的readFileSync
```javascript
    function readText(pathname) {
        var bin = fs.readFileSync(pathname);
    
        if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
            bin = bin.slice(3);
        }
        return bin.toString('utf-8');
    }
```
### GBK转UTF8
GBK编码不在NodeJS自身支持范围内。因此，一般我们借助iconv-lite这个三方包来转换编码。使用NPM下载该包后，我们可以按下边方式编写一个读取GBK文本文件的函数。
```javascript
    var iconv = require('iconv-lite');
    
    function readGBKText(pathname) {
        var bin = fs.readFileSync(pathname);
    
        return iconv.decode(bin, 'gbk');
    }
```
### 单字节编码
有时候读取文件的时候不能确定其编码,这种情况简单的处理方法就是单字节编码。
因为无论utf8 还是 gbk 对于英文和英文字符解析的都是一样的, 都在ASCL0~128之间
大多数我们需要处理的情况是操作读取到的英文js代码 (除字符串和注释)
因此可以只处理js代码部分
```javascript
    1. GBK编码源文件内容：
        var foo = '中文';
    2. 对应字节：
        76 61 72 20 66 6F 6F 20 3D 20 27 D6 D0 CE C4 27 3B
    3. 使用单字节编码读取后得到的内容：
        var foo = '{乱码}{乱码}{乱码}{乱码}';
    4. 替换内容：
        var bar = '{乱码}{乱码}{乱码}{乱码}';
    5. 使用单字节编码保存后对应字节：
        76 61 72 20 62 61 72 20 3D 20 27 D6 D0 CE C4 27 3B
    6. 使用GBK编码读取后得到内容：
        var bar = '中文';
```
**使用同样的单字节编码保存这些乱码字符时，背后对应的字节保持不变。**
NodeJS中自带了一种binary编码可以用来实现这个方法
```javascript
    function replace(pathname) {
        var str = fs.readFileSync(pathname, 'binary');
        str = str.replace('foo', 'bar');
        fs.writeFileSync(pathname, str, 'binary');
    }
```
### 总结
- 不要使用拼接字符串的方式来处理路径，使用path模块。
- 需要对文件读写做到字节级别的精细控制时，请使用fs模块的文件底层操作API
- 掌握好目录遍历和文件编码处理技巧，很实用。

# 网络操作
## 一个简单的node服务器
```javascript
    const http = require('http')
    http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type':'text-plain'})
      res.end('Hello,World\n')
    }).listen(8080, (err) => {
      if(err) {
        console.log(err)
        return
      }
      console.log('a server has running at localhost:8080\n')
    })
```
## API
### http
http模块提供两种使用方式

- 作为服务器使用时, 创建一个HTTP服务器，监听HTTP客户端并相应请求
- 作为客服端使用时, 发起一起HTTP请求，获取服务器相应

HTTP请求本质上是一个数据流，由请求头（headers）和请求体（body）组成。例如以下是一个完整的HTTP请求数据内容。
```javascript
    POST / HTTP/1.1
    User-Agent: curl/7.26.0
    Host: localhost
    Accept: */*
    Content-Length: 11
    Content-Type: application/x-www-form-urlencoded
    
    Hello World
```
在回调函数中，除了可以使用request对象访问请求头数据外，还能把request对象当作一个只读数据流来访问请求体数据。
```javascript
    http.createServer(function (request, response) {
        var body = [];
    
        console.log(request.method);
        console.log(request.headers);
    
        request.on('data', function (chunk) {
            body.push(chunk);
        });
    
        request.on('end', function () {
            body = Buffer.concat(body);
            console.log(body.toString());
        });
    }).listen(80);
```
在回调函数中，除了可以使用response对象来写入响应头数据外，还能把response对象当作一个只写数据流来写入响应体数据。例如在以下例子中，服务端原样将客户端请求的请求体数据返回给客户端。
```javascript
    http.createServer(function (request, response) {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
    
        request.on('data', function (chunk) {
            response.write(chunk);
        });
    
        request.on('end', function () {
            response.end();
        });
    }).listen(80);
```
发起一个http请求
```javscript
    var options = {
            hostname: 'www.example.com',
            port: 80,
            path: '/upload',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
    
    var request = http.request(options, function (response) {});
    
    request.write('Hello World');
    request.end()
```
### https
https模块与http模块极为类似，区别在于https模块需要额外处理SSL证书。
在服务端模式下，创建一个HTTPS服务器的示例如下。
```javascript
    var options = {
        key: fs.readFileSync('./ssl/default.key'), // 私钥
        cert: fs.readFileSync('./ssl/default.cer') // 公钥
    };

    var server = https.createServer(options, function (request, response) {
            // ...
    });
```
同一个服务器可以为多个域名配置不同的证书
```javascript
    server.addContext('foo.com', {
        key: fs.readFileSync('./ssl/foo.com.key'),
        cert: fs.readFileSync('./ssl/foo.com.cer')
    });
    
    server.addContext('bar.com', {
        key: fs.readFileSync('./ssl/bar.com.key'),
        cert: fs.readFileSync('./ssl/bar.com.cer')
    });
```
在客户端模式下，发起一个HTTPS客户端请求与http模块几乎相同，示例如下。
```javascript
    var options = {
        hostname: 'www.example.com',
        port: 443,
        path: '/',
        method: 'GET'
    };

    var request = https.request(options, function (response) {});
    
    request.end();
```
但如果目标服务器使用的SSL证书是自制的，不是从颁发机构购买的，默认情况下https模块会拒绝连接，提示说有证书安全问题。在options里加入**rejectUnauthorized: false**字段可以禁用对证书有效性的检查，从而允许https模块请求开发环境下使用自制证书的HTTPS服务器。
### URL
该模块允许解析URL、生成URL，以及拼接URL
url.parse
```javascript
    url.parse('http://user:pass@host.com:8080/p/a/t/h?query=string#hash')
    /* =>
    { protocol: 'http:',
      auth: 'user:pass',
      host: 'host.com:8080',
      port: '8080',
      hostname: 'host.com',
      hash: '#hash',
      search: '?query=string',
      query: 'query=string',
      pathname: '/p/a/t/h',
      path: '/p/a/t/h?query=string',
      href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash' }
    */
```
传递给parse的不一定是完整的URL, 例如在服务器回调函数中，requeset.url中不包含协议头和域名
```javascript
    http.createServer(function (request, response) {
        var tmp = request.url; // => "/foo/bar?a=b"
        url.parse(tmp);
        /* =>
        { protocol: null,
          slashes: null,
          auth: null,
          host: null,
          port: null,
          hostname: null,
          hash: null,
          search: '?a=b',
          query: 'a=b',
          pathname: '/foo/bar',
          path: '/foo/bar?a=b',
          href: '/foo/bar?a=b' }
        */
    }).listen(80);
```
.parse方法还支持第二个和第三个布尔类型可选参数。第二个参数等于true时，该方法返回的URL对象中，query字段不再是一个字符串，而是一个经过querystring模块转换后的参数对象。第三个参数等于true时，该方法可以正确解析不带协议头的URL，例如//www.example.com/foo/bar。

url.format
format方法则是相反， 把URL对象转换为URL字符串
```javascript
    url.format({
        protocol: 'http:',
        host: 'www.example.com',
        pathname: '/p/a/t/h',
        search: 'query=string'
    });
    /* =>
    'http://www.example.com/p/a/t/h?query=string'
    */
```
### Query String
querystring模块用于实现URL参数字符串与参数对象的互相转换
```javascript
  querystring.parse('foo=bar&baz=qux&baz=quux&corge');
  /* =>
  { foo: 'bar', baz: ['qux', 'quux'], corge: '' }
  */

  querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' });
  /* =>
  'foo=bar&baz=qux&baz=quux&corge='
  */
```
### Zlib
zlib模块提供了数据压缩和解压的功能。当我们处理HTTP请求和响应时，可能需要用到这个模块。

使用Zlib.gzip压缩返回的数据
```javascript
  let zlib = require('zlib')
  http.createServer(function(request, response) {
    let data = '',
        i = 1024
    while (i--) {
      data += ','
    }
    if ((request.headers['accept-encoding'] || '').indexOf('gzip') !== -1) { // 接受压缩数据
      zlib.gzip(data, function(err, data){
        response.writeHead(200, {
          'Content-Type': 'text/plain',
          'Content-Encoding': 'gzip'
        })
        response.end(data)
      })
    } else {
      response.writeHead(200, {
        'Content-Type': 'text/plain'
      })
      response.end(data)
    }
  }).listen(80)
```
使用zlib.gunzip解压接受的数据
```javascript
  let options = {
    hostname: 'www.example.com',
    port: 80,
    path: '/'
    method: 'GET',
    headers: {
      'Accept-Encoding': 'gzip deflate'
    }
  }
  http.request(options, function(response) {
    var body = []
    response.on('data', function(chunk) {
      body.push(chunk)
    })
    response.on('end', function() {
      body = Buffer.concat(body)
      if ((response.headers['content-encoding'] || '').indexOf('gzip') !== -1) {
        zlib.gunzip(body, function(err, data) {
          console.log(data.toString())
        })
      } else {
        console.log(data.toString())
      }
    })
  })
```
### Net
net模块可用于创建Socket服务器或Socket客户端。
Socket服务器, 这个HTTP服务器不管收到啥请求，都固定返回相同的响应。
```javascript
  let net = require('net')
  net.createServer(function(conn) {
    conn.on('data', function(data) {
      conn.write([
        'HTTP/1.1 200 OK',
        'Content-Type: text/plain',
        'Content-Length: 11',
        '',
        'Hello World'
      ].join('\n'))
    })
  }).listen(80)
```
Socket发起HTTP客户端请求
```javascript
  let options = {
    port: 80,
    host: 'www.example.com'
  }
  let client = net.connect(options, function() {
    client.write([
      'GET/HTTP/1.1'
      'User-Agent: curl/7.26.0'
      'Host: www.baidu.com',
      'Accept: */*',
      '',
      ''
    ].join('\n'))
  })
  client.on('data', function(data) {
    console.log(data.toString())
    client.end()
  })
```
**一些注意**
 - 为什么通过headers对象访问到的HTTP请求头或响应头字段不是驼峰的？
 
 答： 从规范上讲，HTTP请求头和响应头字段都应该是驼峰的。但现实是残酷的，不是每个HTTP服务端或客户端程序都严格遵循规范，所以NodeJS在处理从别的客户端或服务端收到的头字段时，都统一地转换为了小写字母格式，以便开发者能使用统一的方式来访问头字段，例如headers['content-length']。
 
 - 为什么http模块创建的HTTP服务器返回的响应是chunked传输方式的？
 
 答： 因为默认情况下，使用.writeHead方法写入响应头后，允许使用.write方法写入任意长度的响应体数据，并使用.end方法结束一个响应。由于响应体数据长度不确定，因此NodeJS自动在响应头里添加了Transfer-Encoding: chunked字段，并采用chunked传输方式。但是当响应体数据长度确定时，可使用.writeHead方法在响应头里加上Content-Length字段，这样做之后NodeJS就不会自动添加Transfer-Encoding字段和使用chunked传输方式。
 
 - 为什么使用http模块发起HTTP客户端请求时，有时候会发生socket hang up错误？
 
 答： 发起客户端HTTP请求前需要先创建一个客户端。http模块提供了一个全局客户端http.globalAgent，可以让我们使用.request或.get方法时不用手动创建客户端。但是全局客户端默认只允许5个并发Socket连接，当某一个时刻HTTP客户端请求创建过多，超过这个数字时，就会发生socket hang up错误。解决方法也很简单，通过http.globalAgent.maxSockets属性把这个数字改大些即可。另外，https模块遇到这个问题时也一样通过https.globalAgent.maxSockets属性来处理。
 
 # 进程操作
 ## 开始
 NodeJs调用终端命令
 拷贝整个目录 cp -r source/* target
 ```javascript
  
  var child_process = require('child_process');
  var util = require('util');

  function copy(source, target, callback) {
     child_process.exec(util.format('cp -r %s/* %s', source, target), callback);
  }
  
  copy('a', 'b', function (err) {
     // ...
  });
 ```
 
 