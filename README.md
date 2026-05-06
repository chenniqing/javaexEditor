# javaexEditor

`javaexEditor` 是一个不绑定框架的富文本编辑器，适合在 jQuery、Vue、React 或普通后台页面中使用。它提供工具栏、图片/视频、Word 导入、表格、表情、代码块、公式、预览、草稿恢复、多语言、AI 调用入口和业务扩展机制。

编辑器本体只做通用能力。播放器、素材库、商品卡片、内部附件选择器这类业务功能，建议在业务项目中通过 `extensions` 注入。

## 安装

```bash
npm install javaex-editor@1.0.1
```

ESM 项目中使用：

```js
import { createEditor } from "javaex-editor";

const editor = createEditor("#editor", {
  editorId: "article-editor",
  value: "<p>初始内容</p>",
  height: 460,
  maxHeight: 620,
  onChange(payload) {
    console.log(payload.html, payload.text, payload.markdown);
  }
});
```

CDN 或静态资源方式使用：

```html
<div id="editor"></div>
<script src="https://javaex.javaex.cn/javaexEditor/1.0.1/javaex-editor.umd.js"></script>
<script>
  var editor = javaexEditor.editor({
    id: "editor",
    editorId: "article-editor",
    value: "<p>初始内容</p>"
  });
</script>
```

编辑器样式会随 JS 自动注入，使用 CDN 时不需要再单独引入 CSS 文件。保存内容的只读展示页可以使用 `createRichTextRuntime`，也可以按业务展示页自己的样式处理。

## 使用文档

- [jQuery 项目使用说明](docs/jquery-usage.md)
- [Vue 3 项目使用说明](docs/vue3-usage.md)
- [React 项目使用说明](docs/react-usage.md)

## 常用配置

```js
createEditor("#editor", {
  editorId: "article-editor",
  value: "<h2>javaexEditor</h2><p>请输入正文。</p>",
  placeholder: "请输入富文本内容",
  height: 460,
  maxHeight: 620,
  toolbar: [
    "font", "size", "format", "separator",
    "image", "video", "importWord", "separator",
    "bold", "italic", "underline", "foreColor", "backColor", "separator",
    "orderedList", "unorderedList", "table", "quote", "code", "formula", "separator",
    "emoji", "preview", "fullscreen"
  ],
  onChange(payload) {
    // payload.html   HTML 内容
    // payload.text   纯文本内容
    // payload.markdown Markdown 内容
  }
});
```

| 配置项 | 说明 |
| --- | --- |
| `target` / `id` | 挂载节点。ESM 推荐 `createEditor(target, options)`，UMD 可用 `id` |
| `editorId` | 编辑器实例编号，用于草稿隔离 |
| `value` / `modelValue` | 初始 HTML 内容 |
| `placeholder` | 占位提示 |
| `height` / `maxHeight` | 编辑区最小高度和最大高度 |
| `disabled` | 是否禁用 |
| `editMode` | 初始编辑模式，`html` 或 `markdown` |
| `previewMode` | 预览方式，`dialog` 或 `split` |
| `toolbar` | 工具栏按钮顺序 |
| `emojiGroups` | 自定义表情分组 |
| `imageUploader` | 图片上传回调；不传时本地图片会转成 base64 插入 |
| `ai` | AI 功能配置 |
| `extensions` | 业务扩展按钮或 AI 面板动作 |
| `locale` / `locales` / `messages` | 多语言配置 |
| `onChange` / `callback` | 内容变化回调 |

## 工具栏 key

`toolbar` 使用英文 key 配置顺序。`separator` 表示分隔线。

| key | 功能 | key | 功能 |
| --- | --- | --- | --- |
| `font` | 字体 | `size` | 字号 |
| `format` | 段落格式 | `image` | 图片 |
| `video` | 视频 | `importWord` | 导入 Word |
| `link` | 插入链接 | `unlink` | 取消链接 |
| `undo` | 撤销 | `redo` | 重做 |
| `bold` | 加粗 | `italic` | 斜体 |
| `underline` | 下划线 | `strike` | 删除线 |
| `superscript` | 上标 | `subscript` | 下标 |
| `foreColor` | 字体颜色 | `backColor` | 背景颜色 |
| `hr` | 分割线 | `selectAll` | 全选 |
| `removeFormat` | 清除格式 | `indent` | 增加缩进 |
| `outdent` | 减少缩进 | `justifyLeft` | 左对齐 |
| `justifyCenter` | 居中对齐 | `justifyRight` | 右对齐 |
| `orderedList` | 有序列表 | `unorderedList` | 无序列表 |
| `table` | 表格 | `quote` | 引用 |
| `code` | 代码块 | `formula` | 数学公式 |
| `emoji` | 表情 | `preview` | 预览 |
| `fullscreen` | 全屏 | `ai` | AI 面板 |
| `separator` | 分隔线 |  |  |

## 图片上传

不配置 `imageUploader` 时，编辑器会把本地图片转成 base64 插入，适合快速试用。生产项目建议接入自己的上传接口。

```js
createEditor("#editor", {
  async imageUploader(files, context) {
    const result = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      }).then((res) => res.json());

      result.push({
        url: response.url,
        alt: file.name,
        title: file.name
      });
    }
    return result;
  }
});
```

## 多语言

默认语言是中文 `zh-CN`，内置支持英文 `en-US`。可以初始化时指定语言，也可以运行时切换。

```js
const editor = createEditor("#editor", {
  locale: "en-US"
});

editor.setLocale("zh-CN");
```

自定义扩展其他语言时，通过 `locales` 传入语言包。语言包可以只覆盖需要改的字段。

```js
const jaJP = {
  toolbar: {
    image: "画像",
    video: "動画",
    bold: "太字",
    preview: "プレビュー"
  },
  dialog: {
    remoteImageTitle: "リモート画像を追加",
    remoteImageUrl: "リモート画像 URL"
  },
  tips: {
    remoteImageRequired: "リモート画像 URL を入力してください"
  },
  common: {
    ok: "確認",
    cancel: "キャンセル"
  }
};

const editor = createEditor("#editor", {
  locale: "ja-JP",
  locales: {
    "ja-JP": jaJP
  }
});

editor.setLocale("en-US");
editor.setLocale("ja-JP");
```

## 自定义表情

不传 `emojiGroups` 或传空数组时，编辑器使用默认表情。需要保留默认表情时，把 `defaultEmojiGroups` 拼进去；需要去掉默认表情时，只传自己的分组。

```js
import { createEditor, defaultEmojiGroups } from "javaex-editor";

const customEmojiGroups = [
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

createEditor("#editor", {
  emojiGroups: defaultEmojiGroups.concat(customEmojiGroups)
});
```

## AI 功能

编辑器只提供 AI 面板和内容回填逻辑，真正的 AI 请求由业务项目实现。

```js
createEditor("#editor", {
  toolbar: ["bold", "image", "preview", "ai"],
  ai: {
    enabled: true,
    request(messages, payload, context) {
      return fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      }).then((res) => res.json());
    },
    getResult(response) {
      return response.data || response.content || "";
    }
  }
});
```

## 业务扩展

扩展按钮显示在工具栏时，需要同时配置 `toolbar` 和 `extensions`。

```js
createEditor("#editor", {
  toolbar: ["bold", "image", "xigua-player", "preview"],
  extensions: [
    {
      key: "xigua-player",
      label: "西瓜播放器",
      placement: "toolbar",
      iconSvg: "<svg viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7-11-7Z\" fill=\"currentColor\"/></svg>",
      action(context) {
        const url = window.prompt("请输入视频地址");
        if (!url) {
          return;
        }
        context.insertHtml(`<video controls src="${url}"></video><p><br /></p>`);
        context.showTip("已插入播放器");
      }
    }
  ]
});
```

扩展 `action` 会收到 `context`，常用方法包括：

| 方法 | 说明 |
| --- | --- |
| `getHtml()` / `getText()` / `getMarkdown()` | 获取当前内容 |
| `insertHtml(html)` | 在光标位置插入 HTML |
| `setHtml(html)` | 设置整篇内容 |
| `showTip(message, isError)` | 显示提示 |
| `openPreview(tab)` | 打开预览 |
| `openFormulaDialog()` | 打开公式弹窗 |
| `openAiChatDialog()` | 打开 AI 对话弹窗 |
| `getLocale()` / `setLocale(locale)` | 获取或切换语言 |

## 保存内容展示

只读页可以使用运行时工具增强富文本内容，例如图片预览、代码块行号和复制按钮。

```js
import { createRichTextRuntime } from "javaex-editor";

const runtime = createRichTextRuntime({
  copyText: "复制",
  copiedText: "复制成功"
});

await runtime.decorate(document.querySelector(".doc-content"));
```

如果业务扩展插入了自定义 HTML，例如播放器、商品卡片或流程图，展示页也应该在业务项目中调用对应的初始化函数。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| `focus()` | 聚焦 |
| `getHtml()` | 获取 HTML |
| `getText()` | 获取纯文本 |
| `getMarkdown()` | 获取 Markdown |
| `setHtml(html, shouldEmit)` | 设置 HTML |
| `insertHtml(html)` | 插入 HTML |
| `setEditMode(mode)` | 切换 `html` / `markdown` |
| `getLocale()` / `setLocale(locale, messages)` | 获取或切换语言 |
| `openPreview(tab)` | 打开预览 |
| `deleteTextEditorDraft()` | 删除当前实例草稿 |
| `recoverDraft()` | 恢复当前实例草稿 |
| `destroy()` | 销毁实例 |

## 开发构建

```bash
npm install
npm run build
```

构建产物位于 `dist`：

- `dist/javaex-editor.js`：ESM
- `dist/javaex-editor.umd.js`：浏览器 CDN / 静态资源
- `dist/javaex-editor.umd.cjs`：CommonJS
