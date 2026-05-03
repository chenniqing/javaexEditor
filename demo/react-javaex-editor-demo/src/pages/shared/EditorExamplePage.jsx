import { useEffect, useMemo, useRef, useState } from "react";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import { getDefaultEditorHtml, savedContentKey } from "./content.js";
import { toolbarNoAi } from "./toolbar.js";

const baseApi = import.meta.env.VITE_BASE_API || "http://127.0.0.1:7001";

export default function EditorExamplePage({ page }) {
  const [htmlOutput, setHtmlOutput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const editorComponentRef = useRef(null);
  const rawEditorRef = useRef(null);
  const currentEditorId = useMemo(() => `react-demo-${page.key}`, [page.key]);
  const editorPlaceholder = useMemo(() => {
    if (page.placeholder) {
      return page.placeholder;
    }
    if (page.locale === "en-US") {
      return "Enter rich text content";
    }
    if (page.locale === "ja-JP") {
      return "内容を入力してください...";
    }
    return "请输入富文本内容";
  }, [page.locale, page.placeholder]);
  const editorOptions = useMemo(() => {
    const extraOptions = page.createEditorOptions?.({ postJson }) || {};
    return {
      locale: page.locale || "zh-CN",
      locales: page.locales || {},
      ai: { enabled: false },
      ...extraOptions
    };
  }, [page]);

  useEffect(() => {
    rawEditorRef.current = null;
    setHtmlOutput("");
    setTextOutput("");
    if (page.draftContent) {
      seedDraft(currentEditorId, page.draftContent);
    }
    setEditorHtml(page.value || getDefaultEditorHtml());
  }, [currentEditorId, page]);

  function readHtml() {
    const editor = editorComponentRef.current;
    if (!editor) {
      return;
    }
    setHtmlOutput(editor.getHtml());
    setTextOutput(editor.getText());
  }

  function saveCurrentContent() {
    const editor = editorComponentRef.current;
    const instance = rawEditorRef.current;
    if (!editor || !instance) {
      return;
    }
    localStorage.setItem(savedContentKey, editor.getHtml());
    instance.showTip("已保存到展示页");
  }

  function handleEditorChange(payload) {
    setHtmlOutput(payload.html || "");
    setTextOutput(payload.text || "");
  }

  function handleEditorReady(instance) {
    rawEditorRef.current = instance;
    setHtmlOutput(instance.getHtml());
    setTextOutput(instance.getText());
  }

  return (
    <>
      <header className="demo-header">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h2>{page.title}</h2>
        </div>
        <div className="demo-actions">
          <button type="button" className="button" onClick={readHtml}>读取 HTML</button>
          <button type="button" className="button button-primary" onClick={saveCurrentContent}>保存到展示页</button>
        </div>
      </header>

      <section className="panel">
        <RichTextEditor
          ref={editorComponentRef}
          value={editorHtml}
          onValueChange={setEditorHtml}
          onChange={handleEditorChange}
          onReady={handleEditorReady}
          editorId={currentEditorId}
          height={460}
          maxHeight={620}
          toolbar={page.toolbar || toolbarNoAi}
          emojiGroups={page.emojiGroups}
          editorOptions={editorOptions}
          placeholder={editorPlaceholder}
        />
      </section>
      <section className="panel">
        <div className="result-grid">
          <label className="result-box">
            <span>HTML</span>
            <textarea value={htmlOutput} readOnly />
          </label>
          <label className="result-box">
            <span>纯文本</span>
            <textarea value={textOutput} readOnly />
          </label>
        </div>
      </section>
    </>
  );
}

function seedDraft(editorId, draftContent) {
  const key = `javaex-edit-content_${editorId}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, draftContent);
  }
}

async function postJson(path, body) {
  const response = await fetch(`${baseApi}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok || data.code !== 0) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data.data;
}
