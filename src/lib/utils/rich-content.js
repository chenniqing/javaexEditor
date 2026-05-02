import { escapeAttribute, escapeHtml } from "./content.js";

const COPY_TIMERS = new WeakMap();
const DEFAULT_CONTENT_STYLE_ID = "javaex-rich-text-content-style";

export const DEFAULT_RICH_TEXT_CONTENT_STYLE = `
  .javaex-rich-text-shell {
    min-height: 0;
  }
  .javaex-rich-text-editor-host {
    min-height: 0;
  }
  .javaex-rich-text-viewer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }
  .javaex-rich-text-viewer-actions {
    display: flex;
    justify-content: flex-end;
  }
  .javaex-rich-text-viewer-body,
  .javaex-rich-text-viewer-empty {
    box-sizing: border-box;
    padding: 24px 28px;
    border: 1px solid var(--javaex-border-color-light, #eef3fc);
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 251, 255, 0.98) 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
    overflow: auto;
  }
  .javaex-rich-text-viewer-empty {
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--javaex-text-secondary, #606266);
  }
  .javaex-rich-text-content {
    line-height: 1.8;
    color: var(--javaex-text-primary, #1f2a44);
    word-break: break-word;
  }
  .javaex-rich-text-content h1,
  .javaex-rich-text-content h2,
  .javaex-rich-text-content h3,
  .javaex-rich-text-content h4,
  .javaex-rich-text-content h5,
  .javaex-rich-text-content h6 {
    margin: 1em 0 0.65em;
    line-height: 1.35;
    color: #122033;
    font-weight: 700;
  }
  .javaex-rich-text-content p,
  .javaex-rich-text-content ul,
  .javaex-rich-text-content ol,
  .javaex-rich-text-content blockquote {
    margin: 0 0 1em;
  }
  .javaex-rich-text-content ul,
  .javaex-rich-text-content ol {
    padding-left: 2em;
    list-style-position: outside;
  }
  .javaex-rich-text-content ul {
    list-style-type: disc;
  }
  .javaex-rich-text-content ol {
    list-style-type: decimal;
  }
  .javaex-rich-text-content ul > li {
    list-style: disc outside;
  }
  .javaex-rich-text-content ol > li {
    list-style: decimal outside;
  }
  .javaex-rich-text-content li {
    display: list-item;
    margin: 4px 0;
  }
  .javaex-rich-text-content img,
  .javaex-rich-text-content video,
  .javaex-rich-text-content iframe {
    max-width: 100%;
    border-radius: 14px;
  }
  .javaex-rich-text-content img.javaex-editor-meme-emoji {
    display: inline-block;
    width: auto;
    max-width: 160px;
    max-height: 160px;
    vertical-align: middle;
  }
  .javaex-rich-text-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 18px 0;
  }
  .javaex-rich-text-content th,
  .javaex-rich-text-content td {
    border: 1px solid var(--javaex-border-color-light, #eef3fc);
    padding: 10px 12px;
    vertical-align: top;
  }
  .javaex-rich-text-content blockquote {
    padding: 12px 16px;
    border-left: 4px solid #72a7ff;
    border-radius: 0 14px 14px 0;
    background: #f7faff;
    color: var(--javaex-text-secondary, #606266);
  }
  .javaex-rich-text-content pre {
    position: relative;
    margin: 18px 0;
    padding: 10px 12px;
    overflow: auto;
    line-height: 24px !important;
    background: #ecf4fa;
    border-radius: 3px;
    white-space: pre-wrap;
  }
  .javaex-rich-text-content code {
    display: inline-block;
    margin: 0 3px;
    padding: 1px 5px;
    border: 1px solid #eee;
    border-radius: 3px;
    background: #f7f7f7;
    color: #666;
    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  }
  .javaex-rich-text-content pre code {
    display: block;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    white-space: inherit;
  }
  .javaex-rich-text-content .hljs {
    display: block;
    overflow-x: auto;
    color: #525252;
    font-size: 14px;
    -webkit-text-size-adjust: none;
  }
  .javaex-rich-text-content .hljs-doctype { color: #999; }
  .javaex-rich-text-content .hljs-tag { color: #3e76f6; }
  .javaex-rich-text-content .hljs-attribute,
  .javaex-rich-text-content .hljs-keyword,
  .javaex-rich-text-content .css .hljs-class { color: #e96900; }
  .javaex-rich-text-content .hljs-value,
  .javaex-rich-text-content .hljs-string { color: #42b983; }
  .javaex-rich-text-content .hljs-comment { color: #b3b3b3; }
  .javaex-rich-text-content .hljs-regexp,
  .javaex-rich-text-content .css .hljs-attribute { color: #af7dff; }
  .javaex-rich-text-content .hljs-built_in { color: #2db7f5; }
  .javaex-rich-text-content .css .hljs-number,
  .javaex-rich-text-content .javascript .hljs-number,
  .javaex-rich-text-content .actionscript .hljs-literal,
  .javaex-rich-text-content .javascript .hljs-literal { color: #fc1e70; }
  .javaex-rich-text-content .hljs-ln {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  .javaex-rich-text-content .hljs-ln td {
    border: 0;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 24px;
    vertical-align: top;
  }
  .javaex-rich-text-content .hljs-ln-numbers {
    width: 30px;
    min-width: 30px;
    padding: 0 8px 0 0;
    text-align: right;
    color: #8b97aa;
    user-select: none;
  }
  .javaex-rich-text-content .hljs-ln td.hljs-ln-numbers {
    border-right: 1px solid #d6dfeb;
  }
  .javaex-rich-text-content .hljs-ln-code {
    padding-left: 12px;
    white-space: pre-wrap;
  }
  .javaex-rich-text-content .javaex-codecopy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.96);
    color: #666;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
`;

export const DEFAULT_RICH_TEXT_PREVIEW_STYLE = `
  :root {
    color-scheme: light;
    --page-bg: #f4f8ff;
    --card-bg: #ffffff;
    --text-primary: #1f2a44;
    --text-secondary: #5f6b85;
    --border-color: #e6eefc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px 20px;
    font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
    background:
      radial-gradient(circle at top right, rgba(79, 140, 255, 0.12), transparent 28%),
      linear-gradient(180deg, #f8fbff 0%, var(--page-bg) 100%);
    color: var(--text-primary);
  }
  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 36px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    box-shadow: 0 18px 48px rgba(31, 42, 68, 0.1);
  }
  .javaex-rich-text-content {
    line-height: 1.8;
    word-break: break-word;
  }
  .javaex-rich-text-content h1,
  .javaex-rich-text-content h2,
  .javaex-rich-text-content h3,
  .javaex-rich-text-content h4,
  .javaex-rich-text-content h5,
  .javaex-rich-text-content h6 {
    font-weight: 700;
  }
  .javaex-rich-text-content ul,
  .javaex-rich-text-content ol {
    padding-left: 2em;
    list-style-position: outside;
  }
  .javaex-rich-text-content ul {
    list-style-type: disc;
  }
  .javaex-rich-text-content ol {
    list-style-type: decimal;
  }
  .javaex-rich-text-content ul > li {
    list-style: disc outside;
  }
  .javaex-rich-text-content ol > li {
    list-style: decimal outside;
  }
  .javaex-rich-text-content li {
    display: list-item;
    margin: 4px 0;
  }
  .javaex-rich-text-content img,
  .javaex-rich-text-content video,
  .javaex-rich-text-content iframe {
    max-width: 100%;
    border-radius: 14px;
  }
  .javaex-rich-text-content img.javaex-editor-meme-emoji {
    display: inline-block;
    width: auto;
    max-width: 160px;
    max-height: 160px;
    vertical-align: middle;
  }
  .javaex-rich-text-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    overflow: hidden;
  }
  .javaex-rich-text-content th,
  .javaex-rich-text-content td {
    border: 1px solid var(--border-color);
    padding: 10px 12px;
    vertical-align: top;
  }
  .javaex-rich-text-content blockquote {
    margin: 18px 0;
    padding: 12px 16px;
    border-left: 4px solid #72a7ff;
    background: #f7faff;
    color: var(--text-secondary);
  }
  .javaex-rich-text-content pre {
    position: relative;
    margin: 18px 0;
    padding: 10px 12px;
    overflow: auto;
    line-height: 24px !important;
    background: #ecf4fa;
    border-radius: 3px;
    white-space: pre-wrap;
  }
  .javaex-rich-text-content code {
    display: inline-block;
    margin: 0 3px;
    padding: 1px 5px;
    border: 1px solid #eee;
    border-radius: 3px;
    background: #f7f7f7;
    color: #666;
    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  }
  .javaex-rich-text-content pre code {
    display: block;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    white-space: inherit;
  }
  .javaex-rich-text-content .hljs {
    display: block;
    overflow-x: auto;
    color: #525252;
    font-size: 14px;
    -webkit-text-size-adjust: none;
  }
  .javaex-rich-text-content .hljs-doctype { color: #999; }
  .javaex-rich-text-content .hljs-tag { color: #3e76f6; }
  .javaex-rich-text-content .hljs-attribute,
  .javaex-rich-text-content .hljs-keyword,
  .javaex-rich-text-content .css .hljs-class { color: #e96900; }
  .javaex-rich-text-content .hljs-value,
  .javaex-rich-text-content .hljs-string { color: #42b983; }
  .javaex-rich-text-content .hljs-comment { color: #b3b3b3; }
  .javaex-rich-text-content .hljs-regexp,
  .javaex-rich-text-content .css .hljs-attribute { color: #af7dff; }
  .javaex-rich-text-content .hljs-built_in { color: #2db7f5; }
  .javaex-rich-text-content .css .hljs-number,
  .javaex-rich-text-content .javascript .hljs-number,
  .javaex-rich-text-content .actionscript .hljs-literal,
  .javaex-rich-text-content .javascript .hljs-literal { color: #fc1e70; }
  .javaex-rich-text-content .hljs-ln {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  .javaex-rich-text-content .hljs-ln td {
    border: 0;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 24px;
    vertical-align: top;
  }
  .javaex-rich-text-content .hljs-ln-numbers {
    width: 30px;
    min-width: 30px;
    padding: 0 8px 0 0;
    text-align: right;
    color: #8b97aa;
    user-select: none;
  }
  .javaex-rich-text-content .hljs-ln td.hljs-ln-numbers {
    border-right: 1px solid #d6dfeb;
  }
  .javaex-rich-text-content .hljs-ln-code {
    padding-left: 12px;
    white-space: pre-wrap;
  }
  .javaex-rich-text-content .javaex-codecopy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 10px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.96);
    color: #666;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
`;

const SCRIPT_LOADERS = new Map();

export function normalizeCodeText(block) {
  if (!block) {
    return "";
  }
  const clone = block.cloneNode(true);
  clone.querySelectorAll?.("br").forEach((br) => {
    br.replaceWith("\n");
  });
  clone.querySelectorAll?.("div, p, li, tr").forEach((node) => {
    if (!node.nextSibling || node.nextSibling.textContent !== "\n") {
      node.after("\n");
    }
  });
  clone.querySelectorAll?.("[style]").forEach((node) => {
    if (/display\s*:\s*block/i.test(node.getAttribute("style") || "") && (!node.nextSibling || node.nextSibling.textContent !== "\n")) {
      node.after("\n");
    }
  });
  return String(clone.innerText || clone.textContent || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .trimEnd();
}

export function renderCodeLineNumbers(codeText) {
  const lines = String(codeText || "").split("\n");
  return `<table class="hljs-ln"><tbody>${lines.map((line, index) => `<tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="${index + 1}">${index + 1}</td><td class="hljs-ln-line hljs-ln-code">${escapeHtml(line) || "&nbsp;"}</td></tr>`).join("")}</tbody></table>`;
}

export function selectCodeContent(target) {
  if (!target || typeof window === "undefined") {
    return;
  }
  const selection = window.getSelection?.();
  if (!selection) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(target);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function ensureRichTextContentStyles(style = DEFAULT_RICH_TEXT_CONTENT_STYLE, styleId = DEFAULT_CONTENT_STYLE_ID) {
  if (typeof document === "undefined" || !style || document.getElementById(styleId)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = styleId;
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}

export function decorateRichTextImages(container) {
  if (!container) {
    return;
  }

  container.querySelectorAll("img").forEach((image) => {
    image.loading = image.loading || "lazy";
    image.decoding = image.decoding || "async";
    if (!image.referrerPolicy) {
      image.referrerPolicy = "no-referrer";
    }
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (document.queryCommandSupported?.("copy")) {
    document.execCommand("copy");
  }
}

function updateCopyButtonState(button, text, options) {
  button.textContent = text;
  const oldTimer = COPY_TIMERS.get(button);
  if (oldTimer) {
    clearTimeout(oldTimer);
  }
  if (text === options.copiedText) {
    const timer = window.setTimeout(() => {
      button.textContent = options.copyText;
      COPY_TIMERS.delete(button);
    }, options.feedbackDuration);
    COPY_TIMERS.set(button, timer);
  }
}

export function ensureCodeCopyButton(pre, codeText, options = {}) {
  if (!pre) {
    return;
  }
  const merged = {
    buttonClass: "javaex-codecopy-btn",
    copyText: "复制",
    copiedText: "复制成功",
    feedbackDuration: 2000,
    ...options
  };

  let button = pre.querySelector(`.${merged.buttonClass}`);
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = merged.buttonClass;
    pre.appendChild(button);
  }

  button.textContent = merged.copyText;
  button.dataset.copyText = encodeURIComponent(codeText);
  button.onclick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const codeElement = pre.querySelector("code") || pre;
    const text = decodeURIComponent(button.dataset.copyText || "");
    selectCodeContent(codeElement);
    try {
      await copyText(text);
      updateCopyButtonState(button, merged.copiedText, merged);
    } catch (error) {
      console.error(error);
      updateCopyButtonState(button, merged.copyText, merged);
    }
  };
}

export function decorateRichTextCodeBlocks(container, options = {}) {
  if (!container) {
    return;
  }
  const merged = {
    codeClass: "hljs",
    buttonClass: "javaex-codecopy-btn",
    highlightElement: null,
    lineNumbersBlock: null,
    force: false,
    ...options
  };

  container.querySelectorAll("pre").forEach((pre) => {
    let code = pre.querySelector("code");
    if (!code) {
      code = document.createElement("code");
      code.innerHTML = pre.innerHTML;
      pre.innerHTML = "";
      pre.appendChild(code);
    }
    if (!merged.force && code.dataset.richTextReady === "true") {
      return;
    }

    const codeText = normalizeCodeText(code);
    code.textContent = codeText;
    code.classList.add(merged.codeClass);
    ensureCodeCopyButton(pre, codeText, merged);

    if (typeof merged.highlightElement === "function") {
      merged.highlightElement(code);
    }
    if (typeof merged.lineNumbersBlock === "function") {
      merged.lineNumbersBlock(code);
    } else {
      code.innerHTML = renderCodeLineNumbers(codeText);
    }

    code.dataset.richTextReady = "true";
  });
}

export function buildRichTextContentHtml(source, options = {}) {
  const html = source || "";
  if (typeof document === "undefined") {
    return html;
  }
  const merged = {
    buttonClass: "javaex-codecopy-btn",
    copyText: "复制",
    ...options
  };

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  decorateRichTextImages(wrapper);
  wrapper.querySelectorAll("pre").forEach((pre) => {
    let code = pre.querySelector("code");
    if (!code) {
      code = document.createElement("code");
      code.innerHTML = pre.innerHTML;
      pre.innerHTML = "";
      pre.appendChild(code);
    }
    const codeText = normalizeCodeText(code);
    code.classList.add("hljs");
    code.innerHTML = renderCodeLineNumbers(codeText);

    if (!pre.querySelector(`.${merged.buttonClass}`)) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = merged.buttonClass;
      button.textContent = merged.copyText;
      button.dataset.copyText = encodeURIComponent(codeText);
      pre.appendChild(button);
    }
  });
  return wrapper.innerHTML;
}

export function buildRichTextDisplayHtml(source) {
  const html = source || "";
  if (typeof document === "undefined") {
    return html;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  decorateRichTextImages(wrapper);
  return wrapper.innerHTML;
}

export function buildRichTextPreviewDocument({ title = "内容预览", content = "", style = "", buttonClass = "javaex-codecopy-btn", copyText = "复制", copiedText = "复制成功" } = {}) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>${style}</style>
</head>
<body>
  <main class="page">
    <article class="javaex-rich-text-content">${content}</article>
  </main>
  <script>
    document.addEventListener('click', async function(event) {
      const button = event.target.closest('.${escapeAttribute(buttonClass)}');
      if (!button) return;
      event.preventDefault();
      const pre = button.closest('pre');
      const code = pre ? (pre.querySelector('code') || pre) : null;
      if (!code) return;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        const text = decodeURIComponent(button.dataset.copyText || '');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
          document.execCommand('copy');
        }
        button.textContent = '${escapeHtml(copiedText)}';
        window.setTimeout(function() {
          button.textContent = '${escapeHtml(copyText)}';
        }, 2000);
      } catch (error) {}
    });
  <\/script>
</body>
</html>`;
}

export function loadRichTextScript(src) {
  if (typeof document === "undefined" || !src) {
    return Promise.resolve();
  }
  if (SCRIPT_LOADERS.has(src)) {
    return SCRIPT_LOADERS.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const selector = `script[data-rich-text-script="${escapeAttribute(src)}"]`;
    const existingScript = document.querySelector(selector);
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.richTextScript = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    SCRIPT_LOADERS.delete(src);
    throw error;
  });

  SCRIPT_LOADERS.set(src, promise);
  return promise;
}

export function createRichTextRuntime(options = {}) {
  const merged = {
    highlightScripts: [],
    previewStyle: DEFAULT_RICH_TEXT_PREVIEW_STYLE,
    contentStyle: DEFAULT_RICH_TEXT_CONTENT_STYLE,
    contentStyleId: DEFAULT_CONTENT_STYLE_ID,
    injectContentStyle: true,
    buttonClass: "javaex-codecopy-btn",
    copyText: "复制",
    copiedText: "复制成功",
    getHighlightRuntime: () => {
      if (typeof window === "undefined") {
        return {};
      }
      return {
        highlightElement: window.hljs?.highlightElement || window.hljs?.highlightBlock,
        lineNumbersBlock: window.hljs?.lineNumbersBlock
      };
    },
    ...options
  };

  async function ensureHighlightRuntime() {
    for (const src of merged.highlightScripts) {
      await loadRichTextScript(src);
    }
  }

  async function decorate(container, decorateOptions = {}) {
    if (!container) {
      return;
    }
    if (merged.injectContentStyle) {
      ensureRichTextContentStyles(merged.contentStyle, merged.contentStyleId);
    }
    decorateRichTextImages(container);
    await ensureHighlightRuntime();
    const runtime = merged.getHighlightRuntime?.() || {};
    decorateRichTextCodeBlocks(container, {
      buttonClass: merged.buttonClass,
      copyText: merged.copyText,
      copiedText: merged.copiedText,
      highlightElement: typeof runtime.highlightElement === "function"
        ? (block) => runtime.highlightElement(block)
        : null,
      lineNumbersBlock: typeof runtime.lineNumbersBlock === "function" ? runtime.lineNumbersBlock : null,
      ...decorateOptions
    });
  }

  function buildContentHtml(content, contentOptions = {}) {
    return buildRichTextContentHtml(content, {
      buttonClass: merged.buttonClass,
      copyText: merged.copyText,
      ...contentOptions
    });
  }

  function buildDisplayHtml(content) {
    return buildRichTextDisplayHtml(content);
  }

  function buildPreviewHtml({ title = "内容预览", content = "" } = {}) {
    return buildRichTextPreviewDocument({
      title,
      content: buildContentHtml(content),
      style: merged.previewStyle,
      buttonClass: merged.buttonClass,
      copyText: merged.copyText,
      copiedText: merged.copiedText
    });
  }

  async function openPreview({ title = "内容预览", content = "", blockedMessage = "" } = {}) {
    if (typeof window === "undefined") {
      return false;
    }
    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      if (blockedMessage && window.javaex?.error) {
        window.javaex.error(blockedMessage);
      }
      return false;
    }

    previewWindow.document.open();
    previewWindow.document.write(buildPreviewHtml({ title, content }));
    previewWindow.document.close();
    return true;
  }

  return {
    ensureHighlightRuntime,
    decorate,
    buildDisplayHtml,
    buildContentHtml,
    buildPreviewHtml,
    openPreview
  };
}
