# javaexEditor 使用文档

`javaexEditor` 是一个可嵌入业务系统的富文本编辑器。编辑器本体只提供通用能力，例如工具栏、HTML 编辑、Markdown 预览、图片上传、AI 调用入口、表情、公式、代码块和扩展机制；具体业务功能（例如某个播放器、素材库、内部卡片）应该放在业务项目中通过 `extensions` 注入。

## 安装与构建

```bash
npm install
npm run build
```

业务项目通过包入口引入：

```js
import { createEditor, defaultEmojiGroups } from 'javaex-editor';
import 'javaex-editor/dist/style.css';
```

## 基础用法

```js
const editor = createEditor('#editor', {
    editorId: 'demo-editor',
    value: '<p>初始内容</p>',
    height: 460,
    maxHeight: 620,
    toolbar: ['font', 'size', 'format', 'separator', 'bold', 'image', 'preview', 'ai'],
    onChange(payload) {
        console.log(payload.html, payload.text, payload.markdown);
    }
});
```

## 常用配置

| 配置项 | 中文意思 | 说明 |
| --- | --- | --- |
| `target` | 挂载目标 | CSS 选择器或 DOM 节点 |
| `editorId` | 编辑器编号 | 用于草稿隔离等场景 |
| `value` / `modelValue` | 初始内容 | HTML 字符串 |
| `placeholder` | 占位提示 | 编辑区为空时显示 |
| `height` | 最小高度 | 数字或 CSS 高度字符串 |
| `maxHeight` | 最大高度 | 超出后编辑区内部滚动 |
| `disabled` | 禁用 | 禁用整个编辑器 |
| `editMode` | 编辑模式 | `html` 或 `markdown` |
| `previewMode` | 预览模式 | `dialog` 弹窗或 `split` 分栏 |
| `toolbar` | 工具栏 | 按工具英文 key 配置顺序 |
| `emojiGroups` | 表情分组 | 不传或传空数组时使用内置表情 |
| `extensions` | 扩展动作 | 业务自定义 AI 面板动作或工具栏按钮 |
| `ai` | AI 配置 | 配置接口、返回值提取和提示词 |
| `formula` | 公式配置 | 是否启用和自定义渲染 |
| `imageUploader` | 图片上传 | 业务自定义上传回调 |
| `onChange` | 内容变化回调 | 返回 HTML、纯文本和 Markdown |

## 工具栏工具

`toolbar` 按下面的英文 key 配置。`separator` 是分隔线，不是按钮。

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

## AI 配置

编辑器内置“一键润色”和“AI 对话”的界面与内容回填逻辑。业务侧只需要配置接口地址、结果提取方式，必要时覆盖提示词。

```js
createEditor('#editor', {
    ai: {
        enabled: true,
        request(messages, payload, context) {
            return fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            }).then((res) => res.json());
        },
        getResult(response) {
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

业务扩展如果要出现在工具栏，需要同时做两件事：

1. 在 `toolbar` 中加入扩展的英文 key。
2. 在 `extensions` 中注册同名扩展，并设置 `placement: 'toolbar'`。

```js
createEditor('#editor', {
    toolbar: ['bold', 'image', 'my-card', 'preview'],
    extensions: [
        {
            key: 'my-card',
            label: '业务卡片',
            placement: 'toolbar',
            iconSvg: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
            async action(context) {
                const title = window.prompt('请输入卡片标题');
                if (!title) {
                    return;
                }
                context.insertHtml(`<section class="my-card">${title}</section><p><br /></p>`);
                context.showTip('已插入业务卡片');
            }
        }
    ]
});
```

扩展字段说明：

| 字段 | 中文意思 | 说明 |
| --- | --- | --- |
| `key` | 扩展英文 key | 必填，需要和 `toolbar` 中的 key 一致 |
| `label` | 扩展中文名称 | 用于 tooltip 或面板按钮 |
| `shortLabel` | 短名称 | 没有图标时显示在按钮上 |
| `description` | 描述 | AI 面板中显示 |
| `placement` | 放置位置 | `toolbar` 工具栏，`ai` AI 面板 |
| `iconName` | 内置图标名 | 使用编辑器已有图标 |
| `iconSvg` / `icon` | 自定义图标 | 业务传入 SVG 字符串 |
| `allowMarkdown` | 允许 Markdown 模式执行 | 默认 `false` |
| `action` | 点击动作 | 接收编辑器 `context` |

## AI 面板扩展

不需要工具栏按钮，只想放进 AI 面板时，把 `placement` 设置为 `ai`，或者不写 `placement`。

```js
createEditor('#editor', {
    extensions: [
        {
            key: 'summary',
            label: '生成摘要',
            description: '根据当前内容生成一段摘要',
            placement: 'ai',
            async action(context) {
                const html = context.getHtml();
                context.insertHtml(`<blockquote>${html.slice(0, 80)}</blockquote>`);
            }
        }
    ]
});
```

## EditorContext

扩展和上传器会收到 `context`，常用方法如下：

| 方法 | 中文意思 |
| --- | --- |
| `focus()` | 聚焦编辑器 |
| `getHtml()` | 获取 HTML |
| `getText()` | 获取纯文本 |
| `getMarkdown()` | 获取 Markdown |
| `getEditMode()` | 获取当前编辑模式 |
| `insertHtml(html)` | 在光标处插入 HTML |
| `setHtml(html)` | 设置整篇 HTML |
| `openPreview(tab)` | 打开预览 |
| `showTip(message, isError)` | 显示提示 |
| `openFormulaDialog()` | 打开公式弹窗 |
| `openAiChatDialog()` | 打开 AI 对话弹窗 |

## 图片上传

```js
createEditor('#editor', {
    async imageUploader(files, context) {
        const result = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', { method: 'POST', body: formData }).then((res) => res.json());
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

## 只读展示

业务只读页建议使用运行时工具处理代码块、图片预览等富文本展示能力：

```js
import { createRichTextRuntime } from 'javaex-editor';

const runtime = createRichTextRuntime();
await runtime.decorate(document.querySelector('.doc-content'));
```

如果业务扩展插入了自定义 HTML（例如播放器、商品卡片、流程图），只读页也应该在业务项目中调用自己的装饰函数进行初始化，不要把这些业务初始化逻辑写进 javaexEditor。
