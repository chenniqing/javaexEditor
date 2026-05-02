export const defaultEmojiGroups = [
  {
    key: "default",
    label: "默认表情",
    items: [
      "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😉", "😊", "😍",
      "😘", "😋", "😎", "🤔", "😴", "😭", "😡", "🥳", "😇", "🤗",
      "🤩", "🙌", "👏", "👍", "👎", "👌", "✌️", "🙏", "💪", "❤️",
      "💖", "💯", "🎉", "🌹", "🔥", "⭐", "🎈", "☕", "🍀", "🎵"
    ]
  },
  {
    key: "cute",
    label: "颜文字",
    items: [
      "(๑•̀ㅂ•́)و", "(￣▽￣)", "(ง •̀_•́)ง", "(｡◕‿◕｡)", "(づ｡◕‿‿◕｡)づ",
      "(≧▽≦)", "(●'◡'●)", "(*/ω＼*)", "(╯°□°）╯", "(｡•̀ᴗ-)✧",
      "(＞▽＜)", "( •̀ ω •́ )✧", "(っ °Д °;)っ", "(⊙_⊙)", "(T_T)",
      "(ಥ_ಥ)", "(╥﹏╥)", "(￢_￢)", "(ノω<。)ノ))☆", "(=・ω・=)",
      "(ฅ'ω'ฅ)", "ヽ(✿ﾟ▽ﾟ)ノ", "ヾ(≧▽≦*)o", "o(*￣▽￣*)ブ", "(～￣▽￣)～",
      "ψ(｀∇´)ψ", "(。_。)", "(^///^)", "(づ￣ 3￣)づ", "╰(*°▽°*)╯",
      "Σ(っ °Д °;)っ", "(￣y▽￣)╭"
    ]
  },
  {
    key: "office",
    label: "办公常用",
    items: [
      "✔", "✘", "⚠️", "ℹ️", "❗", "❓", "📌", "📎", "📢", "📣",
      "⭐", "🔥", "✅", "⏳", "📅", "📝", "📈", "📉", "📤", "📥"
    ]
  }
];

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

export function sanitizeHtml(html = "") {
  return String(html)
    .replace(/\u200b/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
}

export function normalizeHtml(html = "") {
  return sanitizeHtml(html)
    .replace(/&nbsp;/gi, " ")
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />")
    .trim();
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value = "") {
  return escapeHtml(value);
}

export function htmlToText(html = "") {
  if (typeof document === "undefined") {
    return sanitizeHtml(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const div = document.createElement("div");
  div.innerHTML = sanitizeHtml(html);
  return div.innerText.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function polishHtml(html = "") {
  const source = normalizeHtml(html);
  if (!source) {
    return "";
  }

  if (typeof document === "undefined") {
    return source;
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = source;

  wrapper.querySelectorAll("p, div, li, blockquote, td, th").forEach((element) => {
    element.innerHTML = element.innerHTML.replace(/\s*<br\s*\/?>\s*$/gi, "").trim() || "<br />";
  });

  if (!wrapper.querySelector("p, div, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre")) {
    const text = wrapper.textContent?.trim() ?? "";
    if (!text) {
      return "";
    }

    wrapper.innerHTML = text
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  return wrapper.innerHTML
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />")
    .trim();
}

function childrenToMarkdown(node, depth = 0) {
  return Array.from(node.childNodes)
    .map((child) => nodeToMarkdown(child, depth))
    .join("")
    .replace(/[ \t]+\n/g, "\n");
}

function tableToMarkdown(table) {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (!rows.length) {
    return "";
  }

  // Markdown 模式里仍然要展示成标准管道表格，方便用户直接编辑。
  // 但回转 HTML 时我们不会再把首行升级成 thead/th，而是继续当作普通 td 行处理，
  // 这样就能兼顾“Markdown 可编辑性”和“HTML 结构不漂移”。
  const matrix = rows.map((row) => Array.from(row.children).map((cell) => htmlToText(cell.innerHTML).trim()));
  const firstRow = matrix[0] || [];
  const divider = firstRow.map(() => "---");
  const body = matrix.slice(1);
  const lines = [
    `| ${firstRow.join(" | ")} |`,
    `| ${divider.join(" | ")} |`
  ];

  body.forEach((row) => {
    lines.push(`| ${row.join(" | ")} |`);
  });

  return lines.join("\n");
}

function normalizeCodeBlockText(element) {
  if (!element) {
    return "";
  }

  const clone = element.cloneNode(true);

  clone.querySelectorAll?.(".javaex-codecopy-btn, .hljs-ln-numbers").forEach((node) => {
    node.remove();
  });

  clone.querySelectorAll?.("br").forEach((br) => {
    br.replaceWith("\n");
  });

  clone.querySelectorAll?.("div, p, li, tr").forEach((node) => {
    if (!node.nextSibling || node.nextSibling.textContent !== "\n") {
      node.after("\n");
    }
  });

  return String(clone.innerText || clone.textContent || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n+$/, "");
}

function isRawTableHtmlStart(line = "") {
  return /^\s*<table\b/i.test(line);
}

function rawTableHtmlToBlock(lines, start) {
  const blockLines = [];
  let index = start;
  let tableDepth = 0;

  while (index < lines.length) {
    const line = lines[index];
    const openMatches = line.match(/<table\b/gi);
    const closeMatches = line.match(/<\/table>/gi);

    if (openMatches) {
      tableDepth += openMatches.length;
    }

    blockLines.push(line);
    index += 1;

    if (closeMatches) {
      tableDepth -= closeMatches.length;
    }

    if (tableDepth <= 0) {
      break;
    }
  }

  return {
    html: normalizeHtml(blockLines.join("\n")),
    nextIndex: index
  };
}

function nodeToMarkdown(node, depth = 0) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\s+/g, " ") ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node;
  const tag = element.tagName.toLowerCase();
  const content = childrenToMarkdown(element, depth).trim();

  switch (tag) {
    case "br":
      return "\n";
    case "p":
    case "div":
      return `${content}\n\n`;
    case "strong":
    case "b":
      return `**${content}**`;
    case "em":
    case "i":
      return `*${content}*`;
    case "u":
      return `<u>${content}</u>`;
    case "a": {
      const href = element.getAttribute("href") ?? "";
      return `[${content || href}](${href})`;
    }
    case "img": {
      const src = element.getAttribute("src") ?? "";
      const alt = element.getAttribute("alt") ?? "";
      return `![${alt}](${src})`;
    }
    case "h1":
      return `# ${content}\n\n`;
    case "h2":
      return `## ${content}\n\n`;
    case "h3":
      return `### ${content}\n\n`;
    case "h4":
      return `#### ${content}\n\n`;
    case "h5":
      return `##### ${content}\n\n`;
    case "h6":
      return `###### ${content}\n\n`;
    case "blockquote":
      return content
        .split("\n")
        .filter(Boolean)
        .map((line) => `> ${line}`)
        .join("\n") + "\n\n";
    case "ul":
      return `${Array.from(element.children).map((child) => `${"  ".repeat(depth)}- ${nodeToMarkdown(child, depth + 1).trim()}`).join("\n")}\n\n`;
    case "ol":
      return `${Array.from(element.children).map((child, index) => `${"  ".repeat(depth)}${index + 1}. ${nodeToMarkdown(child, depth + 1).trim()}`).join("\n")}\n\n`;
    case "li":
      return `${content}\n`;
    case "pre":
      return `\`\`\`\n${normalizeCodeBlockText(element)}\n\`\`\`\n\n`;
    case "code":
      return `\`${element.textContent ?? ""}\``;
    case "hr":
      return "\n---\n\n";
    case "table":
      return `${tableToMarkdown(element)}\n\n`;
    default:
      return `${content}${VOID_TAGS.has(tag) ? "" : ""}`;
  }
}

export function htmlToMarkdown(html = "") {
  if (typeof document === "undefined") {
    return normalizeHtml(html);
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeHtml(html);

  return Array.from(wrapper.childNodes)
    .map((node) => nodeToMarkdown(node))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function parseInlineMarkdown(text = "") {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, "<em>$1</em>");
}

function isMarkdownTable(lines, start) {
  const current = lines[start] ?? "";
  const next = lines[start + 1] ?? "";
  return current.includes("|") && /^\s*\|?[\s:-]+(?:\|[\s:-]+)+\|?\s*$/.test(next);
}

function markdownTableToHtml(blockLines) {
  const rows = blockLines.map((line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => parseInlineMarkdown(cell.trim())));
  if (rows.length < 2) {
    return `<p>${parseInlineMarkdown(blockLines.join(" "))}</p>`;
  }

  // 第 2 行只是 Markdown 表格的分隔线，不参与真实内容渲染。
  // 这里把所有真实数据行都转成 tbody + td，避免首行被自动解释成表头单元格。
  const body = [rows[0], ...rows.slice(2)];
  const bodyHtml = body.map((row) => `<tr>${row.map((cell) => `<td>${cell || "<br />"}</td>`).join("")}</tr>`).join("");
  return `<table class="javaex-editor-edit-table"><tbody>${bodyHtml}</tbody></table>`;
}

function markdownListToHtml(lines, start) {
  let index = start;
  const items = [];
  const ordered = /^\s*\d+\.\s+/.test(lines[start] ?? "");
  const pattern = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      break;
    }
    const match = line.match(pattern);
    if (!match) {
      break;
    }
    items.push(`<li>${parseInlineMarkdown(match[1].trim()) || "<br />"}</li>`);
    index += 1;
  }

  return {
    html: `<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`,
    nextIndex: index
  };
}

function markdownBlockquoteToHtml(lines, start) {
  let index = start;
  const blockLines = [];
  while (index < lines.length) {
    const line = lines[index];
    if (!/^\s*>\s?/.test(line)) {
      break;
    }
    blockLines.push(line.replace(/^\s*>\s?/, ""));
    index += 1;
  }
  const inner = markdownToHtml(blockLines.join("\n")) || "<p><br /></p>";
  return {
    html: `<blockquote>${inner}</blockquote>`,
    nextIndex: index
  };
}

function markdownCodeBlockToHtml(lines, start) {
  const language = (lines[start].trim().slice(3).trim() || "").toLowerCase();
  let index = start + 1;
  const content = [];
  while (index < lines.length && !/^```/.test(lines[index].trim())) {
    content.push(lines[index]);
    index += 1;
  }
  return {
    html: `<pre><code class="hljs${language ? ` language-${language}` : ""}">${escapeHtml(content.join("\n"))}</code></pre>`,
    nextIndex: index < lines.length ? index + 1 : index
  };
}

export function markdownToHtml(markdown = "") {
  const source = String(markdown).replace(/\r\n?/g, "\n").trim();
  if (!source) {
    return "";
  }

  const lines = source.split("\n");
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      const block = markdownCodeBlockToHtml(lines, index);
      blocks.push(block.html);
      index = block.nextIndex;
      continue;
    }

    if (isRawTableHtmlStart(line)) {
      const block = rawTableHtmlToBlock(lines, index);
      blocks.push(block.html);
      index = block.nextIndex;
      continue;
    }

    if (isMarkdownTable(lines, index)) {
      const tableLines = [lines[index], lines[index + 1]];
      let cursor = index + 2;
      while (cursor < lines.length && lines[cursor].trim() && lines[cursor].includes("|")) {
        tableLines.push(lines[cursor]);
        cursor += 1;
      }
      blocks.push(markdownTableToHtml(tableLines));
      index = cursor;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const block = markdownBlockquoteToHtml(lines, index);
      blocks.push(block.html);
      index = block.nextIndex;
      continue;
    }

    if (/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(line)) {
      const block = markdownListToHtml(lines, index);
      blocks.push(block.html);
      index = block.nextIndex;
      continue;
    }

    if (/^\s*#{1,6}\s+/.test(line)) {
      const match = line.match(/^\s*(#{1,6})\s+(.*)$/);
      const level = Math.min(match?.[1].length || 1, 6);
      blocks.push(`<h${level}>${parseInlineMarkdown(match?.[2]?.trim() || "")}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push("<hr />");
      index += 1;
      continue;
    }

    const paragraphLines = [line];
    let cursor = index + 1;
    while (
      cursor < lines.length &&
      lines[cursor].trim() &&
      !/^```/.test(lines[cursor].trim()) &&
      !isRawTableHtmlStart(lines[cursor]) &&
      !isMarkdownTable(lines, cursor) &&
      !/^\s*>\s?/.test(lines[cursor]) &&
      !/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(lines[cursor]) &&
      !/^\s*#{1,6}\s+/.test(lines[cursor]) &&
      !/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(lines[cursor])
    ) {
      paragraphLines.push(lines[cursor]);
      cursor += 1;
    }

    blocks.push(`<p>${paragraphLines.map((item) => parseInlineMarkdown(item.trim())).join("<br />")}</p>`);
    index = cursor;
  }

  return normalizeHtml(blocks.join(""));
}
