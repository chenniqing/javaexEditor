# jQuery 项目使用 javaexEditor

这份文档面向传统 jQuery、JSP、Thymeleaf、Layui、Bootstrap 等非 Vue 项目。`javaexEditor` 本体只提供通用富文本能力；业务自己的播放器、素材库、商品卡片、附件选择器等功能，请通过 `extensions` 放在业务项目中实现。

## 引入文件

使用打包后的文件：

```html
<script src="/static/javaex-editor/javaex-editor.umd.cjs"></script>
```

页面中准备挂载节点：

```html
<div id="articleEditor"></div>
```

## 创建编辑器

```html
<script>
  var editor = javaexEditor.editor({
    id: 'articleEditor',
    editorId: 'article-editor',
    value: '<p>初始内容</p>',
    height: 460,
    maxHeight: 620,
    toolbar: ['font', 'size', 'format', 'separator', 'bold', 'image', 'preview', 'ai'],
    callback: function (payload) {
      $('#content').val(payload.html);
    }
  });
</script>
```

`id` 是挂载 DOM 的 id；`editorId` 是编辑器实例编号，用于草稿缓存隔离。同一个页面有多个编辑器时，请给每个编辑器设置不同的 `editorId`。

## 工具栏英文与中文

`toolbar` 使用英文 key 配置顺序。`separator` 是分隔线。

| 英文 key | 中文意思 |
| --- | --- |
| `font` | 字体 |
| `size` | 字号 |
| `format` | 段落格式 |
| `image` | 图片 |
| `video` | 视频 |
| `importWord` | 导入 Word |
| `link` | 插入链接 |
| `unlink` | 取消链接 |
| `undo` | 撤销 |
| `redo` | 重做 |
| `bold` | 加粗 |
| `italic` | 斜体 |
| `underline` | 下划线 |
| `strike` | 删除线 |
| `superscript` | 上标 |
| `subscript` | 下标 |
| `foreColor` | 字体颜色 |
| `backColor` | 背景颜色 |
| `hr` | 分割线 |
| `selectAll` | 全选 |
| `removeFormat` | 清除格式 |
| `indent` | 增加缩进 |
| `outdent` | 减少缩进 |
| `justifyLeft` | 左对齐 |
| `justifyCenter` | 居中对齐 |
| `justifyRight` | 右对齐 |
| `orderedList` | 有序列表 |
| `unorderedList` | 无序列表 |
| `table` | 表格 |
| `quote` | 引用 |
| `code` | 代码块 |
| `formula` | 数学公式 |
| `emoji` | 表情 |
| `preview` | 预览 |
| `fullscreen` | 全屏 |
| `ai` | AI 扩展面板 |
| `separator` | 分隔线 |

## 图片上传

推荐使用 `imageUploader` 接管图片上传。返回值可以是图片地址字符串，也可以是包含 `url`、`alt`、`title` 的对象。

```js
var editor = javaexEditor.editor({
  id: 'articleEditor',
  async imageUploader(files, context) {
    var result = [];
    for (var i = 0; i < files.length; i += 1) {
      var formData = new FormData();
      formData.append('file', files[i]);
      var response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).then(function (res) {
        return res.json();
      });
      result.push({
        url: response.url,
        alt: files[i].name,
        title: files[i].name
      });
    }
    return result;
  }
});
```

## AI 功能

编辑器内置 AI 面板和内容回填逻辑。业务项目只需要配置请求函数、返回值读取函数和可选提示词。

```js
javaexEditor.editor({
  id: 'articleEditor',
  ai: {
    enabled: true,
    request: function (messages, payload, context) {
      return fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages })
      }).then(function (res) {
        return res.json();
      });
    },
    getResult: function (response) {
      return response.data || response.content || '';
    },
    prompts: {
      polishSystem: '你是富文本编辑助手。请只返回 HTML 片段，不要解释。',
      chatSystem: '你是富文本编辑助手。请根据用户要求修改内容，只返回 HTML。'
    }
  }
});
```

## 工具栏扩展

业务扩展要显示到工具栏，需要同时配置 `toolbar` 和 `extensions`。扩展 key 自己定义，不属于编辑器内置工具。

```js
javaexEditor.editor({
  id: 'articleEditor',
  toolbar: ['bold', 'image', 'business-card', 'preview'],
  extensions: [
    {
      key: 'business-card',
      label: '业务卡片',
      placement: 'toolbar',
      iconSvg: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      action: function (context) {
        var title = window.prompt('请输入卡片标题');
        if (!title) {
          return;
        }
        context.insertHtml('<section class="business-card">' + title + '</section><p><br /></p>');
        context.showTip('已插入业务卡片');
      }
    }
  ]
});
```

扩展字段含义：

| 字段 | 中文意思 | 说明 |
| --- | --- | --- |
| `key` | 扩展英文 key | 必填，和 `toolbar` 中的 key 一致 |
| `label` | 中文名称 | 用于工具提示或 AI 面板 |
| `shortLabel` | 短名称 | 没有图标时显示在按钮上 |
| `description` | 描述 | AI 面板按钮说明 |
| `placement` | 放置位置 | `toolbar` 工具栏，`ai` AI 面板 |
| `iconName` | 内置图标名 | 复用编辑器已有图标 |
| `iconSvg` / `icon` | 自定义图标 | 业务传入 SVG 字符串 |
| `allowMarkdown` | 允许 Markdown 模式执行 | 默认不允许 |
| `action` | 执行动作 | 点击按钮后调用 |

## 读取与设置内容

```js
var html = editor.getHtml();
var text = editor.getText();
var markdown = editor.getMarkdown();

editor.setHtml('<p>新的内容</p>');
editor.insertHtml('<strong>插入内容</strong>');
editor.openPreview('preview');
```

## 草稿处理

```js
editor.deleteTextEditorDraft();
editor.recoverDraft();

javaexEditor.deleteTextEditorDraft('article-editor');
```

## 销毁实例

页面关闭弹窗、切换 Tab 或移除 DOM 前，建议销毁实例释放事件和弹窗资源。

```js
editor.destroy();
```
