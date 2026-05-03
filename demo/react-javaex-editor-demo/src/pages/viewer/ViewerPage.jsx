import { useEffect, useRef, useState } from "react";
import { decorateXiguaPlayers } from "../../utils/editor-extensions/xigua-player.js";
import { savedContentKey } from "../shared/content.js";

export default function ViewerPage({ page }) {
  const [viewerHtml, setViewerHtml] = useState("");
  const viewerBodyRef = useRef(null);

  useEffect(() => {
    renderViewerContent();
  }, []);

  useEffect(() => {
    enhanceCodeBlocks(viewerBodyRef.current);
    decorateXiguaPlayers(viewerBodyRef.current).catch(() => {});
  }, [viewerHtml]);

  function renderViewerContent() {
    setViewerHtml(localStorage.getItem(savedContentKey) || getViewerFallbackHtml());
  }

  return (
    <>
      <header className="demo-header">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h2>{page.title}</h2>
        </div>
        <div className="demo-actions">
          <button type="button" className="button button-primary" onClick={renderViewerContent}>刷新展示内容</button>
        </div>
      </header>

      <section className="viewer-page">
        <article ref={viewerBodyRef} className="doc-body" dangerouslySetInnerHTML={{ __html: viewerHtml }} />
      </section>
    </>
  );
}

function enhanceCodeBlocks(root) {
  if (!root) {
    return;
  }
  Array.from(root.querySelectorAll("pre")).forEach((pre) => {
    if (pre.closest(".code-block")) {
      return;
    }
    const code = pre.querySelector("code") || pre;
    const codeText = normalizeCodeText(code);
    const language = detectLanguage(code) || "text";
    code.textContent = codeText;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    const numbers = document.createElement("div");
    numbers.className = "code-block__numbers";
    numbers.setAttribute("aria-hidden", "true");
    numbers.innerHTML = codeText.replace(/\n$/, "").split("\n").map((_, index) => `<span>${index + 1}</span>`).join("");

    const languageLabel = document.createElement("span");
    languageLabel.className = "code-block__language";
    languageLabel.textContent = language;

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "code-block__copy";
    copyButton.textContent = "复制";
    copyButton.addEventListener("click", async () => {
      await copyCode(codeText, code);
      copyButton.textContent = "复制成功";
      window.setTimeout(() => {
        copyButton.textContent = "复制";
      }, 2000);
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(languageLabel);
    wrapper.appendChild(copyButton);
    wrapper.appendChild(numbers);
    wrapper.appendChild(pre);
  });
}

function normalizeCodeText(code) {
  return String(code.textContent || "").replace(/\r\n?/g, "\n").replace(/^\n+|\n+$/g, "");
}

function detectLanguage(code) {
  const matched = String(code.className || "").match(/(?:language-|lang-)([a-z0-9_+-]+)/i);
  return matched ? matched[1].toLowerCase() : "";
}

async function copyCode(text, codeElement) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(codeElement);
  selection.removeAllRanges();
  selection.addRange(range);
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  document.execCommand("copy");
}

function getViewerFallbackHtml() {
  return [
    "<h1>保存内容展示页</h1>",
    "<p>这个页面用于渲染保存后的富文本内容，并给代码块增强行号、语言标识和复制按钮。</p>",
    "<table><thead><tr><th>功能</th><th>表现</th></tr></thead><tbody><tr><td>代码块</td><td>显示行号并提供复制反馈</td></tr><tr><td>媒体内容</td><td>保留富文本媒体的展示效果</td></tr></tbody></table>",
    "<pre><code class=\"language-js\">function createEditorPage() {\n  const editor = editorRef.current?.getInstance();\n  editor.setHtml('<p>Hello javaexEditor</p>');\n  return editor.getHtml();\n}</code></pre>"
  ].join("");
}
