# Vue 3 项目使用 javaexEditor

`javaexEditor` 是一个普通 JavaScript 编辑器实例，不是 Vue 插件。Vue 项目中建议封装一个组件，组件只负责挂载、传参、同步 `v-model` 和销毁实例。

## 安装

```bash
npm install javaex-editor@1.0.1
```

## 组件封装

`src/components/RichTextEditor.vue`

```vue
<template>
  <div ref="editorHost" class="rich-editor-host"></div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { createEditor } from "javaex-editor";

const props = defineProps({
  modelValue: { type: String, default: "" },
  editorId: { type: String, default: "vue-rich-editor" },
  placeholder: { type: String, default: "请输入内容" },
  height: { type: [Number, String], default: 460 },
  maxHeight: { type: [Number, String, null], default: undefined },
  toolbar: { type: Array, default: undefined },
  emojiGroups: { type: Array, default: undefined },
  editorOptions: { type: Object, default: () => ({}) }
});

const emit = defineEmits(["update:modelValue", "change", "ready"]);
const editorHost = ref(null);
const editorInstance = shallowRef(null);
const resolvedMaxHeight = computed(() => (props.maxHeight === undefined ? props.height : props.maxHeight));

onMounted(async () => {
  await nextTick();

  const options = {
    ...props.editorOptions,
    editorId: props.editorId,
    value: props.modelValue || "",
    placeholder: props.placeholder,
    height: props.height,
    maxHeight: resolvedMaxHeight.value,
    onChange(payload) {
      emit("update:modelValue", payload.html || "");
      emit("change", payload);
    }
  };

  if (Array.isArray(props.toolbar)) {
    options.toolbar = props.toolbar;
  }
  if (Array.isArray(props.emojiGroups) && props.emojiGroups.length) {
    options.emojiGroups = props.emojiGroups;
  }

  editorInstance.value = createEditor(editorHost.value, options);
  emit("ready", editorInstance.value);
});

watch(() => props.modelValue, (value) => {
  const editor = editorInstance.value;
  if (!editor) {
    return;
  }
  const nextHtml = value || "";
  if (editor.getHtml() !== nextHtml) {
    editor.setHtml(nextHtml, false);
  }
});

onBeforeUnmount(() => {
  editorInstance.value?.destroy?.();
  editorInstance.value = null;
});

defineExpose({
  getHtml: () => editorInstance.value?.getHtml?.() || "",
  getText: () => editorInstance.value?.getText?.() || "",
  setHtml: (html, shouldEmit = false) => editorInstance.value?.setHtml?.(html || "", shouldEmit),
  getInstance: () => editorInstance.value
});
</script>

<style scoped>
.rich-editor-host {
  width: 100%;
  min-width: 0;
}
</style>
```

## 页面中使用

```vue
<template>
  <RichTextEditor
    ref="editorRef"
    v-model="form.content"
    editor-id="article-editor"
    :height="460"
    :max-height="620"
    :toolbar="toolbar"
    :editor-options="editorOptions"
  />
</template>

<script setup>
import { reactive, ref } from "vue";
import RichTextEditor from "@/components/RichTextEditor.vue";

const editorRef = ref(null);
const form = reactive({
  content: "<p>初始内容</p>"
});

const toolbar = ["font", "size", "format", "separator", "bold", "image", "preview"];
const editorOptions = {
  placeholder: "请输入正文"
};
</script>
```

## 图片上传

不配置 `imageUploader` 时，本地图片会以 base64 插入。生产项目建议配置上传函数。

```js
const editorOptions = {
  async imageUploader(files) {
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
};
```

## 多语言

默认中文，英文可以直接使用：

```js
const editorOptions = {
  locale: "en-US"
};
```

自定义日文：

```js
const jaJP = {
  toolbar: {
    image: "画像",
    bold: "太字",
    preview: "プレビュー"
  },
  tips: {
    remoteImageRequired: "リモート画像 URL を入力してください"
  }
};

const editorOptions = {
  locale: "ja-JP",
  locales: {
    "ja-JP": jaJP
  }
};
```

运行时切换：

```js
editorRef.value.getInstance().setLocale("en-US");
editorRef.value.getInstance().setLocale("zh-CN");
```

## 自定义表情

```js
import { defaultEmojiGroups } from "javaex-editor";

const customEmojiGroups = [
  {
    key: "local",
    label: "本地表情",
    items: [
      { type: "image", label: "微笑", value: "/emoji/smile.svg" }
    ]
  }
];

const keepDefaultEmoji = defaultEmojiGroups.concat(customEmojiGroups);
const onlyCustomEmoji = customEmojiGroups;
```

## AI 功能

```js
const editorOptions = {
  ai: {
    enabled: true,
    request(messages) {
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
};
```

## 工具栏扩展

```js
const toolbar = ["bold", "image", "my-player", "preview"];

const editorOptions = {
  extensions: [
    {
      key: "my-player",
      label: "我的播放器",
      placement: "toolbar",
      shortLabel: "播放",
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
};
```

## 保存内容展示

```js
import { createRichTextRuntime } from "javaex-editor";

const runtime = createRichTextRuntime({
  copyText: "复制",
  copiedText: "复制成功"
});

await runtime.decorate(document.querySelector(".doc-content"));
```

## 常用实例方法

| 方法 | 说明 |
| --- | --- |
| `getHtml()` | 获取 HTML |
| `getText()` | 获取纯文本 |
| `getMarkdown()` | 获取 Markdown |
| `setHtml(html)` | 设置 HTML |
| `insertHtml(html)` | 插入 HTML |
| `setLocale(locale)` | 切换语言 |
| `openPreview(tab)` | 打开预览 |
| `deleteTextEditorDraft()` | 删除草稿 |
| `recoverDraft()` | 恢复草稿 |
| `destroy()` | 销毁实例 |
