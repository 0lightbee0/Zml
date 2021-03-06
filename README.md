讨厌html繁琐的语法吗？为何不试试Zml？

## 预览
```zml
html {
    head {
        meta charset=utf-8
        title ~'Hello Zml!'
        link rel=stylesheet @css/main.css
        script -js/main.js
    }
    body {
        div .HelloBox #hb01 {
            span .title ~'This is a title'
            label for=tx01 ~'Text: '
            input #tx01 type=text placehoder='Please input you text'
            ul {
                li { a @http://www.baidu.com ~baidu }
                li { a @http://www.sina.com ~sina }
                li { a @http://www.hahae.com ~hahae }
            }
        }
    }
}
```

## 使用方法
```
let paser=new ZmlParser();
let greetTx="Hello Zml";
let tree=paser.parse(`
    root:div .root ~sdfskd {
        span .title ~${greetTx}
    }
`); // {root: [HTMLDIVElement.root]}
let body=document.querySelector("body");
body.appendChild(tree.root);
```

    一定要使用别名进行标注，否则不会出现在tree中。可以将别名视为导出的名字。

## 专有名称的解释
### 原子名称
标识节点类型的名称
如预览中的`html`,`div`,`li`等等，对应着html中的标签名
### 原子属性名，属性值
如预览中的`charset`,`.`,`~`等等，对应着html中的属性名，而后面接的值分别代表属性对应的值

## 功能字符

    需要注意的是，功能字符只在特定场合发挥特殊功能，其它的地方相当于一个普通字符

这是字符是zml采用的特殊功能符号，具有特殊意义，以下是所有的功能字符

| 符号 | 意 义| 发挥功能的场合 |
|---|---|---|
| `{`,`}` | 描述对象的子对象的分界符 | 除了在字符串之外的任意地方 |
| `:` | 别名命名标识 | 类名组中 |
| `=` | 描述对象的属性 | 类名组之后边界符之前的原子组 |
| `'`,`"` | 字符串边界 | 类名组之后边界符之前的原子组 |
| `空格字符`，`制表字符`，`回车字符`，`\0` | 空白字符，组的边界，用来分隔zml的组 | 字符串中 |
| `简写属性名` | 可以由用户设定，允许用户使用定义过的别名映射为全名 | 类名组之后边界符之前的原子组 |
| `简写符号` | 可以由用户设定，允许用户使用更简洁的方式定义属性 | 类名组之后边界符之前的原子组 |
| `非确定字符` | 视为string类型 | |
| `^` | 功能一般化，将之后的任意一个字符视为一个普通字符处理，一般用于转义 | |
| `*=` | 一般化简写属性名，将简写名作为普通属性而不是用户映射的全名属性 | |

按性质分类

| 符号 | 性质 |
| --- | --- |
| `{`,`}` | 任意层嵌套 |
| `'`,`"` | 单层嵌套 |
| `简写符号` | 左接空白，右接值 |
| `=`,`:`,`*=` | 两边接字符串 |
| `^` | 只在显式字符串内部可以使用 |
| `\0` | 放在你想让解析器结束解析的地方，一般你不会指定，除非你想提前结束解析 |

## 简写符号
简写符号可以映射成用户定义的属性全名，使用时直接接属性值
简写符号是非常有限的，仅仅只能使用标准美式键盘布局上的可输入符号，由于`'`和`"`是全局的功能符号，所以这个符号不能用作简写符号
可映射字符列表

    ~`!@#$%&*()_-+={[}]:;|\<,>.?/

以下是一个映射例子
html5 DOM

| 符号 | 意 义|
| --- | --- |
| `.` | className |
| `#` | id |
| `~` | textContent |
| `@` | href |
| `-` | src |
| `*` | charset |

## 连续
如果各个不同的原子之间没有存在`空白原子`则视为各个原子之间是连续的

## 原子组
除`结构组`外由一至三个连续原子构成的原子集称作`原子组`

## 描述组
一个描述组解释了一个对象的构造;由一个类名组和任意个属性组以及一个可选的结构组构成，描述组之间用`空白原子`分隔

## 原子组的分类
每一个原子组都具有且只有一个性质。按照原子组的性质的分类列表如下

| 原子性质标识 | 名称 | 构成 |
| --- | --- | --- |
| `:` | 类名组 | string:string |
| `=` | 属性组 | string=value,string*=value,-value |
| `{}` | 结构组 | { @... } |


    在上表中-value表示简写属性后面直接接值，-表示任何简写符号，上表中的@表示一条描述，后面的...表示可能存在多个描述组。在这篇文字中都是这个意思

## 简写属性名
简写属性名可以映射成用户定义的全名，使用起来仅仅是将全名替换成简写
以下是一个映射例子
html5 DOM

| 符号 | 意 义|
| --- | --- |
| text | textContent |
| for | htmlFor |
| class | className |

## 解释器字符收集原则
只控制确定字符，非确定字符都属于 `string` 类型，其中确定字符包括了`功能字符`和`简写符号`
