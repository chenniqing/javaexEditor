# Vue 3 项目使用 javaexEditor

这份文档面向 Vue 3 项目。`javaexEditor` 是非 Vue 的编辑器实例，Vue 组件只负责挂载、传参、同步 `v-model` 和销毁实例。播放器、业务卡片、素材库等定制能力不要写进编辑器源码，应放在业务项目中通过 `extensions` 注入。

## 安装

当前项目可以通过本地包方式安装：

```json
{
  "dependencies": {
    "javaex-editor": "file:../javaexEditor"
  }
}
```

安装依赖：

```bash
npm install
```

## 基础组件封装

```vue
<template>
  <div ref="editorHost" class="rich-editor-host"></div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { createEditor } from 'javaex-editor';

const props = defineProps({
  modelValue: { type: String, default: '' },
  editorId: { type: String, default: 'vue-rich-editor' },
  height: { type: [Number, String], default: 460 },
  maxHeight: { type: [Number, String, null], default: undefined },
  toolbar: { type: Array, default: undefined },
  emojiGroups: { type: Array, default: undefined },
  editorOptions: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['update:modelValue', 'change', 'ready']);
const editorHost = ref(null);
const editorInstance = shallowRef(null);

onMounted(async () => {
  await nextTick();

  const options = {
    ...props.editorOptions,
    editorId: props.editorId,
    value: props.modelValue || '',
    height: props.height,
    maxHeight: props.maxHeight === undefined ? props.height : props.maxHeight,
    onChange(payload) {
      emit('update:modelValue', payload.html || '');
      emit('change', payload);
    }
  };

  if (Array.isArray(props.toolbar)) {
    options.toolbar = props.toolbar;
  }
  if (Array.isArray(props.emojiGroups) && props.emojiGroups.length) {
    options.emojiGroups = props.emojiGroups;
  }

  editorInstance.value = createEditor(editorHost.value, options);
  emit('ready', editorInstance.value);
});

watch(() => props.modelValue, (value) => {
  const editor = editorInstance.value;
  if (!editor) {
    return;
  }
  if (editor.getHtml() !== (value || '')) {
    editor.setHtml(value || '', false);
  }
});

onBeforeUnmount(() => {
  editorInstance.value?.destroy?.();
  editorInstance.value = null;
});
</script>

<style scoped>
.rich-editor-host {
  width: 100%;
  min-width: 0;
}
</style>
```

注意：如果业务把工具栏放在 `editorOptions.toolbar` 中，就不要再用 `toolbar: props.toolbar` 固定覆盖它。只有 `props.toolbar` 明确传了数组时才覆盖，否则应保留 `editorOptions.toolbar`。

## 页面中使用

```vue
<template>
  <RichTextEditor
    v-model="form.content"
    editor-id="article-editor"
    placeholder="请输入内容"
    :height="460"
    :max-height="620"
    :editor-options="editorOptions"
  />
</template>

<script setup>
import { reactive } from 'vue';
import RichTextEditor from '@/components/RichTextEditor.vue';

const form = reactive({
  content: ''
});

const editorOptions = {
  toolbar: ['font', 'size', 'format', 'separator', 'bold', 'image', 'preview', 'ai']
};
</script>
```

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

## 表情

不传 `emojiGroups` 或传空数组时，编辑器会使用内置表情。

```js
import { defaultEmojiGroups } from 'javaex-editor';

const emojiGroups = [
  ...defaultEmojiGroups,
  {
    key: 'custom',
    label: '自定义',
    items: [
      '😀',
      { type: 'image', label: '点赞', value: '/emoji/like.png' }
    ]
  }
];
```

## 图片上传

```js
const editorOptions = {
  async imageUploader(files, context) {
    const result = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData);
      result.push({
        url: response.url,
        alt: file.name,
        title: file.name
      });
    }
    return result;
  }
};
```

## AI 功能

业务只需要告诉编辑器怎么请求后端接口，以及从返回值中取哪段内容。

```js
const editorOptions = {
  ai: {
    enabled: true,
    request(messages, payload, context) {
      return aiService.chat(messages);
    },
    getResult(response) {
      return response.data || response.content || response;
    },
    prompts: {
      polishSystem: '你是富文本编辑助手。请只返回 HTML 片段，不要解释。',
      chatSystem: ({ scopeText }) => `你是富文本编辑助手。${scopeText}请只返回 HTML。`
    }
  }
};
```

## 工具栏扩展

业务扩展要显示在工具栏，必须同时配置 `toolbar` 和 `extensions`。

```js
const editorOptions = {
  toolbar: ['bold', 'image', 'my-player', 'preview'],
  extensions: [
    {
      key: 'my-player',
      label: '我的播放器',
      placement: 'toolbar',
      iconSvg: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z" fill="currentColor"/></svg>',
      async action(context) {
        const url = window.prompt('请输入视频地址');
        if (!url) {
          return;
        }
        context.insertHtml(`<video controls src="${url}"></video><p><br /></p>`);
        context.showTip('已插入播放器');
      }
    }
  ]
};
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

## 只读展示

```js
import { createRichTextRuntime } from 'javaex-editor';

const richTextRuntime = createRichTextRuntime();
await richTextRuntime.decorate(document.querySelector('.doc-content'));
```

如果业务扩展插入了自定义 HTML，例如播放器或业务卡片，只读页需要在业务项目中调用自己的装饰函数初始化，不要把具体业务逻辑写进 `javaexEditor`。

## 常用实例方法

| 方法 | 中文意思 |
| --- | --- |
| `focus()` | 聚焦编辑器 |
| `getHtml()` | 获取 HTML |
| `getText()` | 获取纯文本 |
| `getMarkdown()` | 获取 Markdown |
| `setHtml(html)` | 设置 HTML |
| `insertHtml(html)` | 插入 HTML |
| `openPreview(tab)` | 打开预览 |
| `deleteTextEditorDraft()` | 删除当前草稿 |
| `recoverDraft()` | 恢复当前草稿 |
| `destroy()` | 销毁实例 |
