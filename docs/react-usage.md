# React 项目使用 javaexEditor

`javaexEditor` 不是 React 组件，而是普通 JavaScript 编辑器实例。React 项目中建议封装一个 `RichTextEditor` 组件，把实例创建、内容同步和销毁逻辑集中起来。

## 安装

```bash
npm install javaex-editor@1.0.1
```

## 组件封装

`src/components/RichTextEditor.jsx`

```jsx
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { createEditor } from "javaex-editor";

const RichTextEditor = forwardRef(function RichTextEditor(
  {
    value = "",
    onValueChange,
    onChange,
    onReady,
    editorId = "react-rich-editor",
    placeholder = "请输入内容",
    height = 460,
    maxHeight,
    toolbar,
    emojiGroups,
    editorOptions = {}
  },
  ref
) {
  const hostRef = useRef(null);
  const editorRef = useRef(null);
  const valueRef = useRef(value || "");
  const callbacksRef = useRef({ onValueChange, onChange, onReady });
  const resolvedMaxHeight = maxHeight === undefined ? height : maxHeight;

  useEffect(() => {
    callbacksRef.current = { onValueChange, onChange, onReady };
  }, [onValueChange, onChange, onReady]);

  useEffect(() => {
    if (!hostRef.current || editorRef.current) {
      return undefined;
    }

    const options = {
      ...editorOptions,
      editorId,
      value: valueRef.current,
      placeholder,
      height,
      maxHeight: resolvedMaxHeight,
      onChange(payload) {
        const html = payload?.html || "";
        valueRef.current = html;
        callbacksRef.current.onValueChange?.(html);
        callbacksRef.current.onChange?.(payload);
      }
    };

    if (Array.isArray(toolbar)) {
      options.toolbar = toolbar;
    }
    if (Array.isArray(emojiGroups) && emojiGroups.length) {
      options.emojiGroups = emojiGroups;
    }

    editorRef.current = createEditor(hostRef.current, options);
    callbacksRef.current.onReady?.(editorRef.current);

    return () => {
      editorRef.current?.destroy?.();
      editorRef.current = null;
    };
  }, [editorId, placeholder, height, resolvedMaxHeight, toolbar, emojiGroups, editorOptions]);

  useEffect(() => {
    const nextHtml = value || "";
    valueRef.current = nextHtml;
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (editor.getHtml() !== nextHtml) {
      editor.setHtml(nextHtml, false);
    }
  }, [value]);

  useImperativeHandle(ref, () => ({
    getHtml() {
      return editorRef.current?.getHtml?.() || valueRef.current;
    },
    getText() {
      return editorRef.current?.getText?.() || "";
    },
    setHtml(html, shouldEmit = false) {
      editorRef.current?.setHtml?.(html || "", shouldEmit);
    },
    getInstance() {
      return editorRef.current;
    }
  }));

  return <div ref={hostRef} className="rich-editor-host" />;
});

export default RichTextEditor;
```

样式：

```css
.rich-editor-host {
  width: 100%;
  min-width: 0;
}
```

如果父组件每次渲染都会创建新的 `editorOptions` 对象，编辑器可能被重新创建。建议用 `useMemo` 固定配置对象。

## 页面中使用

```jsx
import { useMemo, useRef, useState } from "react";
import RichTextEditor from "./components/RichTextEditor.jsx";

export default function ArticleEditorPage() {
  const editorRef = useRef(null);
  const [content, setContent] = useState("<p>初始内容</p>");
  const toolbar = useMemo(() => ["font", "size", "format", "separator", "bold", "image", "preview"], []);
  const editorOptions = useMemo(() => ({
    placeholder: "请输入正文"
  }), []);

  function save() {
    const html = editorRef.current?.getHtml() || "";
    console.log(html);
  }

  return (
    <>
      <RichTextEditor
        ref={editorRef}
        value={content}
        onValueChange={setContent}
        editorId="article-editor"
        height={460}
        maxHeight={620}
        toolbar={toolbar}
        editorOptions={editorOptions}
      />
      <button type="button" onClick={save}>保存</button>
    </>
  );
}
```

## 图片上传

不配置 `imageUploader` 时，本地图片会以 base64 插入。生产项目建议配置上传函数。

```jsx
const editorOptions = useMemo(() => ({
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
}), []);
```

## 多语言

默认中文，英文可以直接使用：

```jsx
const editorOptions = useMemo(() => ({
  locale: "en-US"
}), []);
```

自定义日文：

```jsx
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

const editorOptions = useMemo(() => ({
  locale: "ja-JP",
  locales: {
    "ja-JP": jaJP
  }
}), []);
```

运行时切换：

```jsx
editorRef.current?.getInstance()?.setLocale("en-US");
editorRef.current?.getInstance()?.setLocale("zh-CN");
```

## 自定义表情

```jsx
import { defaultEmojiGroups } from "javaex-editor";

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

const keepDefaultEmoji = defaultEmojiGroups.concat(customEmojiGroups);
const onlyCustomEmoji = customEmojiGroups;
```

使用时传给组件：

```jsx
<RichTextEditor emojiGroups={keepDefaultEmoji} />
```

## AI 功能

```jsx
const toolbar = useMemo(() => ["bold", "image", "preview", "ai"], []);
const editorOptions = useMemo(() => ({
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
}), []);
```

## 工具栏扩展

```jsx
const toolbar = useMemo(() => ["bold", "image", "my-player", "preview"], []);
const editorOptions = useMemo(() => ({
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
}), []);
```

## 保存内容展示

```jsx
import { useEffect, useRef } from "react";
import { createRichTextRuntime } from "javaex-editor";

export default function ContentViewer({ html }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    const runtime = createRichTextRuntime({
      copyText: "复制",
      copiedText: "复制成功"
    });
    runtime.decorate(bodyRef.current);
  }, [html]);

  return <article ref={bodyRef} className="doc-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
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
