# jQuery javaexEditor Demo

这是一个不需要启动开发服务器的静态 jQuery 示例，包含两种调用方式：

- `JavaexEditor.createEditor('#editor', options)`
- `javaexEditor.editor({ id: 'articleEditor', ... })`

## 直接打开

双击 `index.html`，或在浏览器中打开：

```text
D:\tools\workspace\workspace-framework\spring-vue\jquery-javaex-editor-demo\index.html
```

页面通过本地 `vendor` 目录加载：

- `jquery.min.js`
- `javaex-editor.umd.js`
- `xigua-player.js`

## 后端地址

默认接口地址在 `index.html` 中配置：

```js
window.JQUERY_JAVAEX_EDITOR_DEMO_API = "http://127.0.0.1:7001";
```

图片上传使用 `/upload/image`，AI 使用 `/ai/chat`。

两个编辑器的图片上传和 AI 请求都使用 `$.ajax`。
