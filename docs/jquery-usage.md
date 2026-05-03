# jQuery 项目使用 javaexEditor

这份文档面向 jQuery、JSP、Thymeleaf、Layui、Bootstrap 等传统页面。jQuery 项目推荐使用 UMD 文件，通过全局对象 `javaexEditor` 创建编辑器。

## 引入文件

使用已经上传到七牛云的文件：

```html
<script src="https://javaex.javaex.cn/javaexEditor/1.0.0/javaex-editor.umd.js"></script>
```

如果要自己托管，先在包项目中执行 `npm run build`，再把 `dist/javaex-editor.umd.js` 上传到自己的静态资源服务器。浏览器页面请使用 `.umd.js`，不要使用 `.umd.cjs`。

编辑器样式会随 JS 自动注入，不需要单独引入 CSS。

页面中准备挂载节点：

```html
<input type="hidden" id="content" name="content" />
<div id="articleEditor"></div>
```

## 创建编辑器

```html
<script>
  var editor = javaexEditor.editor({
    id: "articleEditor",
    editorId: "article-editor",
    value: "<p>初始内容</p>",
    placeholder: "请输入正文",
    height: 460,
    maxHeight: 620,
    toolbar: ["font", "size", "format", "separator", "bold", "image", "preview"],
    callback: function (payload) {
      $("#content").val(payload.html);
    }
  });
</script>
```

`id` 是挂载 DOM 的 id，`editorId` 是编辑器实例编号，用于草稿缓存隔离。同一个页面有多个编辑器时，每个编辑器都应该设置不同的 `editorId`。

## 图片上传

不配置 `imageUploader` 时，本地图片会转成 base64 插入。生产项目建议使用 jQuery AJAX 接入自己的上传接口。

```js
var editor = javaexEditor.editor({
  id: "articleEditor",
  imageUploader: function (files) {
    return Promise.all(Array.from(files).map(function (file) {
      var formData = new FormData();
      formData.append("file", file);

      return $.ajax({
        url: "/api/upload",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false
      }).then(function (response) {
        return {
          url: response.url,
          alt: file.name,
          title: file.name
        };
      });
    }));
  }
});
```

## 多语言

默认中文，内置英文。初始化时可以指定英文：

```js
var editor = javaexEditor.editor({
  id: "articleEditor",
  locale: "en-US"
});
```

运行时切换：

```js
editor.setLocale("zh-CN");
editor.setLocale("en-US");
```

扩展日文或其他语言时，传入 `locales`：

```js
var jaJP = {
  toolbar: {
    image: "画像",
    bold: "太字",
    preview: "プレビュー"
  },
  tips: {
    remoteImageRequired: "リモート画像 URL を入力してください"
  },
  common: {
    ok: "確認",
    cancel: "キャンセル"
  }
};

javaexEditor.editor({
  id: "articleEditor",
  locale: "ja-JP",
  locales: {
    "ja-JP": jaJP
  }
});
```

## 自定义表情

如果要保留默认表情，可以把默认表情和自定义表情拼在一起；如果要去掉默认表情，只传自定义分组即可。

```js
var customEmojiGroups = [
  {
    key: "local",
    label: "本地表情",
    items: [
      { type: "image", label: "微笑", value: "/emoji/smile.svg" }
    ]
  },
  {
    key: "remote",
    label: "远程表情",
    items: [
      { type: "image", label: "Hi", value: "https://dummyimage.com/64x64/4f8cff/ffffff.png&text=Hi" }
    ]
  }
];

javaexEditor.editor({
  id: "articleEditor",
  emojiGroups: JavaexEditor.defaultEmojiGroups.concat(customEmojiGroups)
});
```

## AI 功能

编辑器只负责 AI 面板和内容回填，接口请求由业务项目实现。jQuery 项目可以继续使用 `$.ajax`。

```js
javaexEditor.editor({
  id: "articleEditor",
  toolbar: ["bold", "image", "preview", "ai"],
  ai: {
    enabled: true,
    request: function (messages) {
      return $.ajax({
        url: "/api/ai/chat",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ messages: messages })
      });
    },
    getResult: function (response) {
      return response.data || response.content || "";
    }
  }
});
```

## 工具栏扩展

业务扩展要显示到工具栏，需要同时配置 `toolbar` 和 `extensions`。

```js
javaexEditor.editor({
  id: "articleEditor",
  toolbar: ["bold", "image", "business-card", "preview"],
  extensions: [
    {
      key: "business-card",
      label: "业务卡片",
      placement: "toolbar",
      shortLabel: "卡片",
      action: function (context) {
        var title = window.prompt("请输入卡片标题");
        if (!title) {
          return;
        }
        context.insertHtml("<section class=\"business-card\">" + title + "</section><p><br /></p>");
        context.showTip("已插入业务卡片");
      }
    }
  ]
});
```

## 读取、保存和销毁

```js
var html = editor.getHtml();
var text = editor.getText();
var markdown = editor.getMarkdown();

editor.setHtml("<p>新的内容</p>");
editor.insertHtml("<strong>插入内容</strong>");
editor.openPreview("preview");

editor.deleteTextEditorDraft();
editor.destroy();
```
