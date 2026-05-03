import {
  defaultEmojiGroups,
  escapeAttribute,
  escapeHtml,
  htmlToMarkdown,
  markdownToHtml,
  htmlToText,
  normalizeHtml,
  polishHtml,
  sanitizeHtml
} from "../utils/content";
// 上面这组内容工具负责 HTML 清洗、HTML/Markdown/纯文本互转，以及默认表情数据。
// 图标渲染、运行时样式注入、Word 导入都由独立模块提供。
import { renderIconSvg } from "../assets/icons";
import { ensureEditorStyles } from "./editor-style";
import { importWordFile } from "../utils/office";
import { formatLocaleText, getLocaleValue, resolveLocaleConfig, zhCN } from "../i18n";

// 工具栏下拉项统一在这里定义，渲染和状态同步都复用同一份配置。
const FONT_OPTIONS = [
  { label: "arial", value: "Arial" },
  { label: "宋体", value: "SimSun" },
  { label: "微软雅黑", value: "Microsoft YaHei" },
  { label: "楷体", value: "KaiTi" },
  { label: "黑体", value: "SimHei" },
  { label: "隶书", value: "LiSu" },
  { label: "Consolas", value: "Consolas" }
];

const SIZE_OPTIONS = [
  { label: "12", px: "12px" },
  { label: "14", px: "14px" },
  { label: "16", px: "16px" },
  { label: "18", px: "18px" },
  { label: "24", px: "24px" },
  { label: "32", px: "32px" },
  { label: "48", px: "48px" }
];

const FORMAT_OPTIONS = [
  { label: "p", tag: "P" },
  { label: "H6", tag: "H6" },
  { label: "H5", tag: "H5" },
  { label: "H4", tag: "H4" },
  { label: "H3", tag: "H3" },
  { label: "H2", tag: "H2" },
  { label: "H1", tag: "H1" }
];

const FORMAT_PREVIEW_STYLE = {
  P: "font-size:14px;",
  H6: "font-size:16px;font-weight:normal;",
  H5: "font-size:18px;font-weight:normal;",
  H4: "font-size:20px;font-weight:normal;",
  H3: "font-size:24px;font-weight:normal;",
  H2: "font-size:28px;font-weight:normal;",
  H1: "font-size:32px;font-weight:normal;"
};

const COLOR_OPTIONS = [
  { value: "Black", titleKey: "Black" },
  { value: "Sienna", titleKey: "Sienna" },
  { value: "DarkOliveGreen", titleKey: "DarkOliveGreen" },
  { value: "DarkGreen", titleKey: "DarkGreen" },
  { value: "DarkSlateBlue", titleKey: "DarkSlateBlue" },
  { value: "Navy", titleKey: "Navy" },
  { value: "Indigo", titleKey: "Indigo" },
  { value: "DarkSlateGray", titleKey: "DarkSlateGray" },
  { value: "DarkRed", titleKey: "DarkRed" },
  { value: "DarkOrange", titleKey: "DarkOrange" },
  { value: "Olive", titleKey: "Olive" },
  { value: "Green", titleKey: "Green" },
  { value: "Teal", titleKey: "Teal" },
  { value: "Blue", titleKey: "Blue" },
  { value: "SlateGray", titleKey: "SlateGray" },
  { value: "#EDEEF0", titleKey: "lightGray" },
  { value: "Red", titleKey: "Red" },
  { value: "SandyBrown", titleKey: "SandyBrown" },
  { value: "YellowGreen", titleKey: "YellowGreen" },
  { value: "SeaGreen", titleKey: "SeaGreen" },
  { value: "MediumTurquoise", titleKey: "MediumTurquoise" },
  { value: "RoyalBlue", titleKey: "RoyalBlue" },
  { value: "Purple", titleKey: "Purple" },
  { value: "Gray", titleKey: "Gray" },
  { value: "Magenta", titleKey: "Magenta" },
  { value: "#e96900", titleKey: "orange" },
  { value: "rgb(250, 219, 20)", titleKey: "yellow" },
  { value: "Lime", titleKey: "Lime" },
  { value: "Cyan", titleKey: "Cyan" },
  { value: "DeepSkyBlue", titleKey: "DeepSkyBlue" },
  { value: "#c7254e", titleKey: "wineRed" },
  { value: "#f2f2f2", titleKey: "silver" },
  { value: "Pink", titleKey: "Pink" },
  { value: "Wheat", titleKey: "Wheat" },
  { value: "LemonChiffon", titleKey: "LemonChiffon" },
  { value: "White", titleKey: "White" }
];

// 统一颜色值格式。
// 输入可能是 3 位/6 位十六进制，也可能是不合法值；这里统一规范成 6 位十六进制。
function normalizeHexColor(value, fallback = "#1677ff") {
  const text = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(text)) {
    return text.toLowerCase();
  }
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    const [, a, b, c] = text;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return fallback;
}

// 颜色通道只允许 0-255，超出范围时进行截断。
function clampColorChannel(value) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) {
    return 0;
  }
  return clamp(number, 0, 255);
}

// 把十六进制颜色转换成 RGB 结构，供颜色面板内部计算使用。
function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex, "#000000");
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  };
}

// 把 RGB 结构重新转换成十六进制颜色，便于同步到输入框和预览色块。
function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => clampColorChannel(value).toString(16).padStart(2, "0")).join("")}`;
}

function normalizeCssColor(value) {
  const text = String(value || "").trim();
  if (!text || text === "transparent") {
    return "";
  }
  const hex = normalizeHexColor(text, "");
  if (hex) {
    return hex;
  }
  const match = text.match(/^rgba?\(([^)]+)\)$/i);
  if (!match) {
    return "";
  }
  const parts = match[1].split(",").map((item) => item.trim());
  if (parts.length < 3) {
    return "";
  }
  const alpha = parts[3] == null ? 1 : Number.parseFloat(parts[3]);
  if (Number.isFinite(alpha) && alpha <= 0) {
    return "";
  }
  return rgbToHex(parts[0], parts[1], parts[2]);
}

const PREVIEW_COPY_TIMERS = new WeakMap();

// 颜色面板中的色相条和色板基于 HSV，因此需要在 RGB/HSV 之间互相转换。
function rgbToHsv(r, g, b) {
  const red = clampColorChannel(r) / 255;
  const green = clampColorChannel(g) / 255;
  const blue = clampColorChannel(b) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta) {
    if (max === red) {
      hue = ((green - blue) / delta) % 6;
    } else if (max === green) {
      hue = ((blue - red) / delta) + 2;
    } else {
      hue = ((red - green) / delta) + 4;
    }
  }

  hue = Math.round(((hue * 60) + 360) % 360);
  return {
    h: hue,
    s: max === 0 ? 0 : Math.round((delta / max) * 100),
    v: Math.round(max * 100)
  };
}

// 根据当前 HSV 状态反向计算 RGB，用于更新十六进制值和预览颜色。
function hsvToRgb(h, s, v) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const saturation = clamp(Number(s), 0, 100) / 100;
  const value = clamp(Number(v), 0, 100) / 100;
  const chroma = value * saturation;
  const section = hue / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (section >= 0 && section < 1) {
    red = chroma;
    green = x;
  } else if (section < 2) {
    red = x;
    green = chroma;
  } else if (section < 3) {
    green = chroma;
    blue = x;
  } else if (section < 4) {
    green = x;
    blue = chroma;
  } else if (section < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = value - chroma;
  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255)
  };
}

// 颜色面板顶部保留“重置”和“更多颜色”两个入口。
// “更多颜色”按钮只显示图标，并固定贴在右侧。
function renderColorMenuHtml(action, resetLabel, resetIconName, t) {
  const moreLabel = t("colors.more");
  return `
    <div class="javaex-editor-color-section">
      <div class="javaex-editor-color-actions">
        <button type="button" class="javaex-editor-color-action javaex-editor-color-action-reset" data-menu-action="${action}" data-reset="true">
          <span class="javaex-editor-color-action-icon" aria-hidden="true">${renderIconSvg(resetIconName)}</span>
          <span>${escapeHtml(resetLabel)}</span>
        </button>
        <button
          type="button"
          class="javaex-editor-color-action javaex-editor-color-action-more"
          data-menu-action="${action}-palette-toggle"
          aria-label="${escapeAttribute(moreLabel)}"
          title="${escapeAttribute(moreLabel)}"
        >
          <span class="javaex-editor-color-action-swatch" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <div class="javaex-editor-color-divider"></div>
    <div class="javaex-editor-color-section">
      <div class="javaex-editor-color-grid">
        ${COLOR_OPTIONS.map((color) => `<button type="button" class="javaex-editor-color-dot" data-menu-action="${action}" data-value="${escapeAttribute(color.value)}" style="background-color:${escapeAttribute(color.value)}" title="${escapeAttribute(t(`colorNames.${color.titleKey}`, color.titleKey))}"></button>`).join("")}
      </div>
    </div>
  `;
}

const COMBOBOX_ITEMS = {
  font: { key: "font", labelKey: "combobox.font", menu: "font", defaultLabelKey: "combobox.defaultFont", widthClass: "" },
  size: { key: "size", labelKey: "combobox.size", menu: "size", defaultLabelKey: "combobox.defaultSize", widthClass: "javaex-editor-combobox-size" },
  format: { key: "format", labelKey: "combobox.format", menu: "format", defaultLabelKey: "combobox.defaultFormat", widthClass: "" }
};

const TOOLBAR_ITEM_MAP = {
  image: { key: "image", labelKey: "toolbar.image", iconName: "uploadImage", menu: true },
  video: { key: "video", labelKey: "toolbar.video", iconName: "uploadVideo" },
  importWord: { key: "importWord", labelKey: "toolbar.importWord", iconName: "word" },
  fullscreen: { key: "fullscreen", labelKey: "toolbar.fullscreen", iconName: "fullscreen" },
  link: { key: "link", labelKey: "toolbar.link", iconName: "link" },
  unlink: { key: "unlink", labelKey: "toolbar.unlink", iconName: "unlink" },
  undo: { key: "undo", labelKey: "toolbar.undo", iconName: "undo" },
  redo: { key: "redo", labelKey: "toolbar.redo", iconName: "redo" },
  bold: { key: "bold", labelKey: "toolbar.bold", iconName: "bold" },
  italic: { key: "italic", labelKey: "toolbar.italic", iconName: "italic" },
  underline: { key: "underline", labelKey: "toolbar.underline", iconName: "underline" },
  strike: { key: "strike", labelKey: "toolbar.strike", iconName: "strikethrough" },
  superscript: { key: "superscript", labelKey: "toolbar.superscript", iconName: "superscript" },
  subscript: { key: "subscript", labelKey: "toolbar.subscript", iconName: "subscript" },
  foreColor: { key: "foreColor", labelKey: "toolbar.foreColor", iconName: "fontColor", menu: true },
  backColor: { key: "backColor", labelKey: "toolbar.backColor", iconName: "backgroundColor", menu: true },
  hr: { key: "hr", labelKey: "toolbar.hr", iconName: "divider" },
  selectAll: { key: "selectAll", labelKey: "toolbar.selectAll", iconName: "selectAll" },
  removeFormat: { key: "removeFormat", labelKey: "toolbar.removeFormat", iconName: "clearFormat" },
  indent: { key: "indent", labelKey: "toolbar.indent", iconName: "indentRight" },
  outdent: { key: "outdent", labelKey: "toolbar.outdent", iconName: "indentLeft" },
  justifyLeft: { key: "justifyLeft", labelKey: "toolbar.justifyLeft", iconName: "alignLeft" },
  justifyCenter: { key: "justifyCenter", labelKey: "toolbar.justifyCenter", iconName: "alignCenter" },
  justifyRight: { key: "justifyRight", labelKey: "toolbar.justifyRight", iconName: "alignRight" },
  orderedList: { key: "orderedList", labelKey: "toolbar.orderedList", iconName: "orderedList" },
  unorderedList: { key: "unorderedList", labelKey: "toolbar.unorderedList", iconName: "unorderedList" },
  table: { key: "table", labelKey: "toolbar.table", iconName: "table", menu: true },
  quote: { key: "quote", labelKey: "toolbar.quote", iconName: "quote" },
  code: { key: "code", labelKey: "toolbar.code", iconName: "code" },
  formula: { key: "formula", labelKey: "toolbar.formula", iconName: "mathFormula" },
  emoji: { key: "emoji", labelKey: "toolbar.emoji", iconName: "emoji", menu: true },
  preview: { key: "preview", labelKey: "toolbar.preview", iconName: "preview" },
  ai: { key: "ai", labelKey: "toolbar.ai", iconName: "ai", menu: true }
};

const DEFAULT_TOOLBAR = [
  "font",
  "size",
  "format",
  "separator",
  "image",
  "video",
  "importWord",
  "separator",
  "link",
  "unlink",
  "undo",
  "redo",
  "separator",
  "bold",
  "italic",
  "underline",
  "strike",
  "superscript",
  "subscript",
  "foreColor",
  "backColor",
  "separator",
  "hr",
  "selectAll",
  "removeFormat",
  "separator",
  "indent",
  "outdent",
  "justifyLeft",
  "justifyCenter",
  "justifyRight",
  "separator",
  "orderedList",
  "unorderedList",
  "table",
  "quote",
  "code",
  "formula",
  "separator",
  "emoji",
  "preview",
  "fullscreen",
  "ai"
];

const ACTIVE_COMMANDS = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strike: "strikeThrough",
  superscript: "superscript",
  subscript: "subscript",
  orderedList: "insertOrderedList",
  unorderedList: "insertUnorderedList",
  justifyLeft: "justifyLeft",
  justifyCenter: "justifyCenter",
  justifyRight: "justifyRight"
};

// 这几类行内格式在“空段落 + 折叠光标”场景下不能完全依赖浏览器内建状态，
// 因此需要补一层自定义载体逻辑，确保后续输入仍然带上对应格式。
const INLINE_FORMAT_TAGS = {
  bold: ["STRONG", "B"],
  italic: ["EM", "I"],
  underline: ["U"],
  strike: ["S", "STRIKE", "DEL"]
};

const INLINE_FORMAT_ELEMENTS = {
  bold: "strong",
  italic: "em",
  underline: "u",
  strike: "s"
};

const DEFAULT_OPTIONS = {
  id: "",
  target: null,
  editorId: "",
  locale: "zh-CN",
  locales: {},
  messages: {},
  placeholder: "",
  height: 360,
  maxHeight: null,
  disabled: false,
  editMode: "html",
  previewMode: "dialog",
  toolbarStickyTop: null,
  emojiGroups: defaultEmojiGroups,
  toolbar: DEFAULT_TOOLBAR,
  extensions: [],
  ai: { enabled: true },
  formula: { enabled: true },
  image: null,
  imageUploader: null,
  value: "",
  modelValue: "",
  callback: null,
  onChange: null
};

const DEFAULT_AI_PROMPTS = {
  polishSystem: getLocaleValue(zhCN, "aiPrompts.polishSystem"),
  polishUser: getLocaleValue(zhCN, "aiPrompts.polishUser"),
  chatSystem: getLocaleValue(zhCN, "aiPrompts.chatSystem"),
  chatUser: getLocaleValue(zhCN, "aiPrompts.chatUser")
};

// 通用钳制函数：菜单定位、颜色拖拽、尺寸计算等都会复用。
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// emojiGroups 是可选配置，业务层不传或传空数组时必须回落到内置表情。
// 这里放在编辑器核心兜底，可以避免某个 Vue/React 封装层误传 undefined 后把默认值覆盖掉。
function normalizeEmojiGroups(groups) {
  return Array.isArray(groups) && groups.length ? groups : defaultEmojiGroups;
}

function localizeEmojiGroups(groups, t) {
  return normalizeEmojiGroups(groups).map((group) => {
    const label = t(`emoji.${group.key}`, group.label);
    return { ...group, label };
  });
}

function stripAiCodeFence(value) {
  return String(value || "")
    .trim()
    .replace(/^```(?:html)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function renderTemplate(template, payload = {}) {
  if (typeof template === "function") {
    return String(template(payload) || "");
  }
  return String(template || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = key.split(".").reduce((result, name) => result?.[name], payload);
    return value == null ? "" : String(value);
  });
}

function resolveAiResponseContent(response) {
  if (typeof response === "string") {
    return response;
  }
  if (!response || typeof response !== "object") {
    return "";
  }
  if (typeof response.html === "string") {
    return response.html;
  }
  if (typeof response.text === "string") {
    return response.text;
  }
  if (typeof response.content === "string") {
    return response.content;
  }
  if (typeof response.message === "string") {
    return response.message;
  }
  if (response.data && response.data !== response) {
    return resolveAiResponseContent(response.data);
  }
  return "";
}

// 解析编辑器挂载节点。
// 支持直接传选择器、真实 DOM，或者通过 options.id 间接定位。
function resolveTarget(target, options) {
  if (typeof target === "string" && target) {
    const element = document.querySelector(target);
    if (!element) {
      throw new Error(`javaexEditor: target not found -> ${target}`);
    }
    return element;
  }

  if (target instanceof HTMLElement) {
    return target;
  }

  if (options.id) {
    const byId = document.getElementById(options.id);
    if (!byId) {
      throw new Error(`javaexEditor: target not found -> #${options.id}`);
    }
    return byId;
  }

  throw new Error("javaexEditor: invalid target");
}

// 为每个编辑器实例生成独立的草稿存储 key，避免多个实例互相干扰。
function getDraftKey(editorId) {
  return `javaex-edit-content_${editorId}`;
}

// 上传回调支持多种返回结构，这里统一整理成编辑器内部可消费的标准数据。
function normalizeUploadResult(result, files) {
  const items = Array.isArray(result) ? result : [result];
  return items
    .map((item, index) => {
      if (!item) {
        return null;
      }
      if (typeof item === "string") {
        return { url: item, alt: files[index]?.name || "" };
      }
      return {
        url: item.url || item.src || item.dataUrl || "",
        alt: item.alt || item.name || files[index]?.name || "",
        title: item.title || "",
        attrs: item.attrs || {}
      };
    })
    .filter((item) => item && item.url);
}

function getObjectValue(source, path) {
  if (!path) {
    return source;
  }
  return String(path).split(".").reduce((value, key) => {
    if (value == null) {
      return undefined;
    }
    return value[key];
  }, source);
}

function resolveLegacyImageUrl(response, imageOptions = {}) {
  if (typeof response === "string") {
    return response;
  }
  const path = imageOptions.imgUrl || "data.url";
  const value = getObjectValue(response, path)
    || response?.url
    || response?.src
    || response?.data?.url
    || response?.data?.imgUrl
    || response?.data;
  if (!value) {
    return "";
  }
  const url = String(value);
  if (imageOptions.dataType === "base64" || /^data:/i.test(url) || /^https?:\/\//i.test(url) || url.startsWith("//")) {
    return url;
  }
  return `${imageOptions.prefix || ""}${url}`;
}

async function uploadLegacyImage(file, imageOptions = {}) {
  const formData = new FormData();
  const param = imageOptions.param || {};
  const fileField = param.file || "file";
  formData.append(fileField, file);
  Object.entries(param).forEach(([key, value]) => {
    if (key !== "file" && value != null) {
      formData.append(key, value);
    }
  });

  const response = await fetch(imageOptions.url, {
    method: imageOptions.method || "POST",
    body: formData,
    headers: imageOptions.header || {},
    credentials: imageOptions.sendCookie ? "include" : "same-origin",
    mode: imageOptions.crossDomain ? "cors" : "same-origin"
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  const url = resolveLegacyImageUrl(data, imageOptions);
  return { url, alt: file.name };
}

function createLegacyImageUploader(imageOptions) {
  if (!imageOptions?.url) {
    return null;
  }
  return async (files) => Promise.all(files.map((file) => uploadLegacyImage(file, imageOptions)));
}

// 默认图片上传兜底方案：把本地文件直接转成 base64 DataURL。
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 清理工具栏配置，只保留系统识别的按钮、下拉框、分隔符，以及业务注册的工具栏扩展。
function normalizeToolbarConfig(toolbar = DEFAULT_TOOLBAR, toolbarExtensionMap = new Map()) {
  return (Array.isArray(toolbar) ? toolbar : DEFAULT_TOOLBAR)
    .map((item) => (item === "separator" ? "separator" : String(item || "").trim()))
    .filter((item) => item === "separator" || COMBOBOX_ITEMS[item] || TOOLBAR_ITEM_MAP[item] || toolbarExtensionMap.has(item));
}

// 生成工具栏中的下拉类按钮，比如字体、字号、段落格式。
function createComboboxHtml(key, t) {
  const item = COMBOBOX_ITEMS[key];
  if (!item) {
    return "";
  }
  const label = t(item.labelKey);
  const defaultLabel = t(item.defaultLabelKey);

  return `
    <div class="javaex-editor-combobox ${item.widthClass || ""}" data-combobox="${item.key}">
      <button type="button" class="javaex-editor-combobox-label" data-menu-toggle="${item.menu}" tooltip-pos="down" tooltip="${escapeAttribute(label)}">
        <i data-label="${item.key}">${escapeHtml(defaultLabel)}</i>
        <span class="icon javaex-editor-caret" aria-hidden="true">${renderIconSvg("chevronDown")}</span>
      </button>
    </div>
  `;
}

// 生成普通工具按钮，比如加粗、图片、预览等。
function createToolHtml(key, t) {
  const item = TOOLBAR_ITEM_MAP[key];
  if (!item) {
    return "";
  }
  const label = t(item.labelKey);
  return `<button type="button" class="javaex-editor-tool" data-tool="${item.key}" ${item.menu ? `data-menu-toggle="${item.key}"` : ""} tooltip-pos="down" tooltip="${escapeAttribute(label)}"><span class="icon" aria-hidden="true">${renderIconSvg(item.iconName)}</span></button>`;
}

// 生成业务扩展挂到工具栏后的按钮。
// iconSvg/icon 是业务侧传入的可信图标片段；如果没有图标，就用 shortLabel/label 显示成文字按钮。
function createExtensionToolHtml(key, toolbarExtensionMap = new Map()) {
  const item = toolbarExtensionMap.get(key);
  if (!item) {
    return "";
  }

  const label = item.label || item.title || item.key;
  const iconHtml = item.iconSvg || item.icon || (item.iconName ? renderIconSvg(item.iconName) : "");
  const content = iconHtml
    ? `<span class="icon" aria-hidden="true">${iconHtml}</span>`
    : `<span class="javaex-editor-tool-label">${escapeHtml(item.shortLabel || label)}</span>`;

  return `<button type="button" class="javaex-editor-tool ${iconHtml ? "" : "javaex-editor-tool-text"}" data-tool="${escapeAttribute(item.key)}" data-extension-tool="true" tooltip-pos="down" tooltip="${escapeAttribute(label)}">${content}</button>`;
}

// 根据配置项类型决定生成分隔线、下拉按钮还是普通按钮。
function createToolbarEntryHtml(key, toolbarExtensionMap = new Map(), t) {
  if (key === "separator") {
    return `<span class="javaex-editor-separator"></span>`;
  }
  if (COMBOBOX_ITEMS[key]) {
    return createComboboxHtml(key, t);
  }
  if (toolbarExtensionMap.has(key)) {
    return createExtensionToolHtml(key, toolbarExtensionMap);
  }
  return createToolHtml(key, t);
}

// 生成简单菜单项按钮，图片来源面板等场景会复用。
function createMenuButtonHtml(label, action, value) {
  return `<button type="button" data-menu-action="${action}" data-value="${escapeAttribute(value)}" data-label="${escapeAttribute(label)}">${escapeHtml(label)}</button>`;
}

// 生成右键菜单项，支持快捷键提示和禁用态。
function createContextMenuItemHtml(label, action, value, shortcut = "", disabled = false) {
  return `<button type="button" class="javaex-editor-context-item" data-menu-action="${action}" data-value="${escapeAttribute(value)}" ${disabled ? "disabled" : ""}><span>${escapeHtml(label)}</span>${shortcut ? `<small>${escapeHtml(shortcut)}</small>` : ""}</button>`;
}

// 表格右键菜单结构较长，单独提成函数，避免 render 方法过于臃肿。
function createTableContextMenuHtml(t) {
  return `
    ${createContextMenuItemHtml(t("tableContext.copy"), "table-action", "copy", "Ctrl+C", true)}
    ${createContextMenuItemHtml(t("tableContext.cut"), "table-action", "cut", "Ctrl+X", true)}
    ${createContextMenuItemHtml(t("tableContext.paste"), "table-action", "paste", "Ctrl+V")}
    <div class="javaex-editor-context-divider"></div>
    <div class="javaex-editor-context-submenu">
      <button type="button" class="javaex-editor-context-item javaex-editor-context-item-arrow">
        <span>${escapeHtml(t("tableContext.table"))}</span>
        <small class="javaex-editor-context-arrow" aria-hidden="true">${renderIconSvg("chevronRight")}</small>
      </button>
      <div class="javaex-editor-context-menu javaex-editor-context-submenu-panel">
        ${createContextMenuItemHtml(t("tableContext.rowHeader"), "table-action", "row-header")}
        ${createContextMenuItemHtml(t("tableContext.colHeader"), "table-action", "col-header")}
        ${createContextMenuItemHtml(t("tableContext.rowHeaderBold"), "table-action", "row-header-bold")}
        ${createContextMenuItemHtml(t("tableContext.colHeaderBold"), "table-action", "col-header-bold")}
        <div class="javaex-editor-context-divider"></div>
        ${createContextMenuItemHtml(t("tableContext.rowAbove"), "table-action", "row-above")}
        ${createContextMenuItemHtml(t("tableContext.rowBelow"), "table-action", "row-below")}
        ${createContextMenuItemHtml(t("tableContext.rowRemove"), "table-action", "row-remove")}
        ${createContextMenuItemHtml(t("tableContext.colLeft"), "table-action", "col-left")}
        ${createContextMenuItemHtml(t("tableContext.colRight"), "table-action", "col-right")}
        ${createContextMenuItemHtml(t("tableContext.colRemove"), "table-action", "col-remove")}
      </div>
    </div>
  `;
}

// 把样式对象快速转成内联 span 字符串，主要给少量 HTML 拼接场景使用。
function createStyledSpan(styleMap, content) {
  const styles = Object.entries(styleMap).map(([key, value]) => `${key}:${value}`).join(";");
  return `<span style="${escapeAttribute(styles)}">${content}</span>`;
}

// 读取浏览器当前选区中的第一个 Range。
// 编辑器内部的大多数插入、格式化操作都依赖这个 Range。
function getSelectionRange() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return null;
  }
  return selection.getRangeAt(0);
}

// 用指定 Range 覆盖浏览器当前选区，从而实现恢复光标、重建选区等能力。
function setSelectionRange(range) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  selection.removeAllRanges();
  selection.addRange(range);
}

export function deleteTextEditorDraft(editorId) {
  try {
    localStorage.removeItem(getDraftKey(editorId));
  } catch {}
}

export class JavaexEditor {
  // 编辑器实例构造函数。
  // 这里会完成参数合并、DOM 渲染、节点缓存、事件绑定、初始内容同步等完整初始化流程。
  constructor(target, options = {}) {
    if (target && typeof target === "object" && !(target instanceof HTMLElement) && !options.target) {
      options = target;
      target = options.target || (options.id ? `#${options.id}` : null);
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      ai: { ...DEFAULT_OPTIONS.ai, ...(options.ai || {}) },
      formula: { ...DEFAULT_OPTIONS.formula, ...(options.formula || {}) }
    };
    this.options.emojiGroups = normalizeEmojiGroups(this.options.emojiGroups);
    this.options.extensions = Array.isArray(this.options.extensions) ? this.options.extensions : [];
    this.options.imageUploader = this.options.imageUploader || createLegacyImageUploader(this.options.image);
    this.localeConfig = resolveLocaleConfig(this.options.locale, this.options.locales, this.options.messages);
    this.options.emojiGroups = localizeEmojiGroups(this.options.emojiGroups, (key, fallback) => this.t(key, fallback));

    this.host = resolveTarget(target, this.options);
    this.options.editorId = this.options.editorId || this.options.id || this.host.id || "javaex-editor";
    // savedRange 保存 HTML 编辑区内最近一次有效的选区/光标位置。
    // 点击工具栏、菜单、弹窗按钮时，会用它把插入点还原回编辑区。
    this.savedRange = null;
    this.activeMenu = "";
    this.activeAnchor = null;
    this.activeTableCell = null;
    this.dialogSelectionRange = null;
    this.formulaAnchor = null;
    this.remoteImageAnchor = null;
    this.aiChatRange = null;
    this.currentEditMode = this.options.editMode === "markdown" ? "markdown" : "html";
    this.currentVideoMode = "url";
    this.currentColorDialogTarget = "foreColor";
    this.selectedForeColor = "";
    this.selectedBackColor = "";
    this.colorDialogState = { h: 215, s: 91, v: 100 };
    this.colorDialogDragType = "";
    this.isFullscreen = false;
    this.pendingPreviewDialogOpen = false;
    this.aiChatResult = "";
    this.tipTimer = null;
    this.toolbarExtensionMap = this.createToolbarExtensionMap();
    this.toolbarSchema = normalizeToolbarConfig(this.options.toolbar, this.toolbarExtensionMap).filter((key) => {
      if (key === "formula" && this.options.formula?.enabled === false) {
        return false;
      }
      if (key === "ai" && this.options.ai?.enabled === false) {
        return false;
      }
      return true;
    });

    ensureEditorStyles();
    this.render();
    this.cacheElements();
    this.bindEvents();
    this.setDisabled(this.options.disabled);
    this.setMinHeight(this.options.height);
    this.setMaxHeight(this.options.maxHeight);
    this.setToolbarStickyTop(this.options.toolbarStickyTop);
    this.setHtml(this.options.value || this.options.modelValue || this.host.dataset.initialHtml || "", false);
    this.setEditMode(this.currentEditMode, false, false);
    this.checkDraftNotice();
    this.updateActiveStates();
    this.updateColorIndicators();
    this.resetInitialIdleState();
  }

  t(key, fallback = "") {
    return getLocaleValue(this.localeConfig.messages, key, fallback);
  }

  tf(key, payload = {}, fallback = "") {
    return formatLocaleText(this.t(key, fallback), payload);
  }

  getLocale() {
    return this.localeConfig.name;
  }

  setLocale(locale, messages = {}) {
    this.options.locale = locale;
    this.options.messages = messages || {};
    this.localeConfig = resolveLocaleConfig(this.options.locale, this.options.locales, this.options.messages);
    this.options.emojiGroups = localizeEmojiGroups(this.options.emojiGroups, (key, fallback) => this.t(key, fallback));
    this.refreshLocaleText();
  }

  refreshLocaleText() {
    if (!this.host) {
      return;
    }

    Object.values(TOOLBAR_ITEM_MAP).forEach((item) => {
      const button = this.host.querySelector(`[data-tool="${item.key}"]:not([data-extension-tool])`);
      if (button) {
        button.setAttribute("tooltip", this.t(item.labelKey));
      }
    });
    Object.values(COMBOBOX_ITEMS).forEach((item) => {
      const button = this.host.querySelector(`[data-combobox="${item.key}"] .javaex-editor-combobox-label`);
      if (button) {
        button.setAttribute("tooltip", this.t(item.labelKey));
      }
    });

    if (this.editor && !this.options.placeholder) {
      this.editor.dataset.placeholder = this.t("placeholder.editor");
    }
    if (this.markdownEditor) {
      this.markdownEditor.placeholder = this.t("placeholder.markdown");
    }

    const foreColorPanel = this.menuPanels?.get("foreColor");
    const backColorPanel = this.menuPanels?.get("backColor");
    if (foreColorPanel) {
      foreColorPanel.innerHTML = renderColorMenuHtml("foreColor", this.t("colors.defaultColor"), "defaultColor", (key, fallback) => this.t(key, fallback));
    }
    if (backColorPanel) {
      backColorPanel.innerHTML = renderColorMenuHtml("backColor", this.t("colors.clearBackground"), "clearBackgroundColor", (key, fallback) => this.t(key, fallback));
    }
    const imagePanel = this.menuPanels?.get("image");
    if (imagePanel) {
      imagePanel.innerHTML = `
        ${createMenuButtonHtml(this.t("menu.uploadLocalImage"), "image-source", "local")}
        ${createMenuButtonHtml(this.t("menu.uploadRemoteImage"), "image-source", "remote")}
      `;
    }

    const tableTitle = this.menuPanels?.get("table")?.querySelector(".javaex-editor-panel-title");
    if (tableTitle) {
      tableTitle.textContent = this.t("menu.tablePickerTitle");
    }
    const aiTitle = this.menuPanels?.get("ai")?.querySelector(".javaex-editor-panel-title");
    if (aiTitle) {
      aiTitle.textContent = this.t("menu.aiPanelTitle");
    }
    if (this.tableContextMenu) {
      this.tableContextMenu.innerHTML = createTableContextMenuHtml((key, fallback) => this.t(key, fallback));
    }
    this.refreshDialogLocaleText();
    this.renderEmojiTabs();
    this.renderAiActions();
    this.updateActiveStates();
    this.hideUploadMask();
  }

  refreshDialogLocaleText() {
    const setText = (root, selector, text) => {
      const node = root?.querySelector(selector);
      if (node) {
        node.textContent = text;
      }
    };
    const setPlaceholder = (root, selector, text) => {
      const node = root?.querySelector(selector);
      if (node) {
        node.placeholder = text;
      }
    };
    const setFooter = (root, submitName, okText = this.t("common.ok")) => {
      const submit = root?.querySelector(`[data-dialog-submit="${submitName}"]`);
      const submitLabel = submit?.querySelector("span:not(.icon)");
      if (submitLabel) {
        submitLabel.textContent = okText;
      } else if (submit) {
        submit.textContent = okText;
      }
      root?.querySelectorAll(".javaex-editor-dialog-footer [data-dialog-close]").forEach((button) => {
        button.textContent = this.t("common.cancel");
      });
    };

    this.initializeDialogChrome();
    setText(this.previewDialogMask, ".javaex-editor-dialog-title", this.t("dialog.contentPreview"));
    setText(this.splitPreviewPane, ".javaex-editor-dialog-title", this.t("dialog.previewPane"));

    const link = this.dialogs?.get("link");
    setText(link, ".javaex-editor-dialog-title", this.t("dialog.linkTitle"));
    setText(link, ".javaex-editor-form-row:nth-child(1) .javaex-editor-form-label", this.t("dialog.linkHref"));
    setText(link, ".javaex-editor-form-row:nth-child(2) .javaex-editor-form-label", this.t("dialog.linkText"));
    setPlaceholder(link, "[data-ref='linkHref']", this.t("placeholder.linkHref"));
    setPlaceholder(link, "[data-ref='linkText']", this.t("placeholder.linkText"));
    setFooter(link, "link");

    const video = this.dialogs?.get("video");
    setText(video, ".javaex-editor-dialog-title", this.t("dialog.videoTitle"));
    setText(video, "[data-video-mode='url']", this.t("dialog.videoUrlMode"));
    setText(video, "[data-video-mode='embed']", this.t("dialog.videoEmbedMode"));
    setText(video, ".javaex-editor-form-row:nth-child(2) .javaex-editor-form-label", this.t("dialog.videoUrl"));
    setText(video, ".javaex-editor-form-row:nth-child(3) .javaex-editor-form-label", this.t("dialog.videoName"));
    setText(video, "[data-ref='videoEmbedRow'] .javaex-editor-form-label", this.t("dialog.videoEmbed"));
    setPlaceholder(video, "[data-ref='videoUrl']", this.t("placeholder.videoUrl"));
    setPlaceholder(video, "[data-ref='videoTitle']", this.t("placeholder.videoTitle"));
    setPlaceholder(video, "[data-ref='videoEmbedCode']", this.t("placeholder.videoEmbed"));
    setFooter(video, "video");

    const remoteImage = this.dialogs?.get("remote-image");
    setText(remoteImage, ".javaex-editor-dialog-title", this.t("dialog.remoteImageTitle"));
    setText(remoteImage, ".javaex-editor-form-label", this.t("dialog.remoteImageUrl"));
    setPlaceholder(remoteImage, "[data-ref='remoteImageUrl']", this.t("placeholder.remoteImageUrl"));
    setFooter(remoteImage, "remote-image");

    const formula = this.dialogs?.get("formula");
    setText(formula, ".javaex-editor-dialog-title", this.t("dialog.formulaTitle"));
    setText(formula, ".javaex-editor-form-row:nth-child(1) .javaex-editor-form-label", this.t("dialog.formulaSource"));
    setText(formula, ".javaex-editor-form-row:nth-child(2) .javaex-editor-form-label", this.t("dialog.formulaDisplay"));
    setPlaceholder(formula, "[data-ref='formulaSource']", this.t("placeholder.formulaSource"));
    setFooter(formula, "formula");
    const formulaLabels = formula?.querySelectorAll(".javaex-editor-form-radio span") || [];
    if (formulaLabels[0]) formulaLabels[0].textContent = this.t("dialog.formulaInline");
    if (formulaLabels[1]) formulaLabels[1].textContent = this.t("dialog.formulaBlock");

    const aiChat = this.dialogs?.get("ai-chat");
    setText(aiChat, ".javaex-editor-dialog-title", this.t("dialog.aiChatTitle"));
    setText(aiChat, ".javaex-editor-form-label", this.t("dialog.aiChatPrompt"));
    setPlaceholder(aiChat, "[data-ref='aiChatPrompt']", this.t("placeholder.aiChatPrompt"));
    setFooter(aiChat, "ai-chat-send", this.t("common.send"));

    const colorPicker = this.dialogs?.get("color-picker");
    setFooter(colorPicker, "color-picker");
    if (this.colorDialogTitle) {
      this.colorDialogTitle.textContent = this.t("colors.dialogTitle");
    }
  }

  // 渲染编辑器的整体静态结构。
  // 包括工具栏、编辑区、预览区、菜单面板、弹窗、上传遮罩、草稿提示和轻提示层。
  render() {
    const t = (key, fallback) => this.t(key, fallback);
    const toolbarHtml = this.toolbarSchema.map((item) => createToolbarEntryHtml(item, this.toolbarExtensionMap, t)).join("");
    const editorPlaceholder = this.options.placeholder || t("placeholder.editor");

    this.host.innerHTML = `
      <div class="javaex-editor-editor">
        <div class="javaex-editor-toolbar" data-ref="toolbar">
          <div class="javaex-editor-toolbar-inner">
            ${toolbarHtml}
            <div class="javaex-editor-mode-switch" data-ref="editModeSwitch">
              <button type="button" class="${this.currentEditMode === "html" ? "active" : ""}" data-edit-mode="html">HTML</button>
              <button type="button" class="${this.currentEditMode === "markdown" ? "active" : ""}" data-edit-mode="markdown">Markdown</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-body">
          <div class="javaex-editor-body-inner">
            <div class="javaex-editor-body-container" data-ref="editor" contenteditable="true" spellcheck="true" data-placeholder="${escapeAttribute(editorPlaceholder)}"></div>
            <textarea class="javaex-editor-markdown-editor" data-ref="markdownEditor" placeholder="${escapeAttribute(t("placeholder.markdown"))}"></textarea>
          </div>
          <div class="javaex-editor-preview-pane" data-ref="splitPreviewPane">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.previewPane"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-close-preview="split">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-preview-body javaex-editor-preview-html" data-ref="splitPreviewHtml"></div>
          </div>
        </div>

        <input type="file" class="javaex-editor-hidden-input" data-ref="imageInput" accept="image/*" multiple />
        <input type="file" class="javaex-editor-hidden-input" data-ref="wordInput" accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword" />

        <div class="javaex-editor-menu javaex-editor-combobox-menu" data-menu-panel="font"><ul class="javaex-editor-menu-list">${FONT_OPTIONS.map((item) => `<li class="javaex-editor-combobox-item" data-menu-action="font" data-label="${escapeAttribute(item.label)}" data-value="${escapeAttribute(item.value)}"><label class="javaex-editor-combobox-item-label">${escapeHtml(item.label)}</label></li>`).join("")}</ul></div>
        <div class="javaex-editor-menu javaex-editor-combobox-menu" data-menu-panel="size"><ul class="javaex-editor-menu-list">${SIZE_OPTIONS.map((item) => `<li class="javaex-editor-combobox-item" data-menu-action="size" data-label="${escapeAttribute(item.label)}" data-value="${escapeAttribute(item.px)}"><label class="javaex-editor-combobox-item-label">${escapeHtml(item.label)}</label></li>`).join("")}</ul></div>
        <div class="javaex-editor-menu javaex-editor-combobox-menu" data-menu-panel="format"><ul class="javaex-editor-menu-list">${FORMAT_OPTIONS.map((item) => `<li class="javaex-editor-combobox-item" data-menu-action="format" data-label="${escapeAttribute(item.label)}" data-value="${escapeAttribute(item.tag)}"><label class="javaex-editor-combobox-item-label" style="${FORMAT_PREVIEW_STYLE[item.tag]}">${escapeHtml(item.label)}</label></li>`).join("")}</ul></div>
        <div class="javaex-editor-menu javaex-editor-color-menu" data-menu-panel="foreColor">${renderColorMenuHtml("foreColor", t("colors.defaultColor"), "defaultColor", t)}</div>
        <div class="javaex-editor-menu javaex-editor-color-menu" data-menu-panel="backColor">${renderColorMenuHtml("backColor", t("colors.clearBackground"), "clearBackgroundColor", t)}</div>
        <div class="javaex-editor-menu javaex-editor-image-menu" data-menu-panel="image">
          ${createMenuButtonHtml(t("menu.uploadLocalImage"), "image-source", "local")}
          ${createMenuButtonHtml(t("menu.uploadRemoteImage"), "image-source", "remote")}
        </div>
        <div class="javaex-editor-menu" data-menu-panel="emoji">
          <div class="javaex-editor-panel javaex-editor-panel-emoji">
            <div class="javaex-editor-panel-tabs" data-ref="emojiTabs">${this.options.emojiGroups.map((group, index) => `<button type="button" ${index === 0 ? 'class="active"' : ""} data-emoji-tab="${escapeAttribute(group.key)}">${escapeHtml(group.label)}</button>`).join("")}</div>
            <div class="javaex-editor-emoji-grid" data-ref="emojiGrid"></div>
          </div>
        </div>
        <div class="javaex-editor-menu" data-menu-panel="table">
          <div class="javaex-editor-panel javaex-editor-panel-table">
            <div class="javaex-editor-panel-title">${escapeHtml(t("menu.tablePickerTitle"))}</div>
            <div class="javaex-editor-table-picker" data-ref="tablePicker"></div>
            <div class="javaex-editor-panel-foot" data-ref="tableFoot">2 x 2</div>
          </div>
        </div>
        <div class="javaex-editor-menu" data-menu-panel="ai">
          <div class="javaex-editor-panel javaex-editor-panel-ai">
            <div class="javaex-editor-panel-title">${escapeHtml(t("menu.aiPanelTitle"))}</div>
            <div data-ref="aiActions"></div>
          </div>
        </div>
        <div class="javaex-editor-context-menu javaex-editor-table-context-menu" data-ref="tableContextMenu">${createTableContextMenuHtml(t)}</div>

        <div class="javaex-editor-dialog-mask" data-dialog="preview">
          <div class="javaex-editor-dialog javaex-editor-dialog-preview">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.contentPreview"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="preview">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-preview-body javaex-editor-preview-html" data-ref="dialogPreviewHtml"></div>
          </div>
        </div>

        <div class="javaex-editor-dialog-mask" data-dialog="link">
          <div class="javaex-editor-dialog">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.linkTitle"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="link">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-dialog-content">
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.linkHref"))}</label>
                <input class="javaex-editor-form-input" data-ref="linkHref" type="text" placeholder="${escapeAttribute(t("placeholder.linkHref"))}" />
              </div>
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.linkText"))}</label>
                <input class="javaex-editor-form-input" data-ref="linkText" type="text" placeholder="${escapeAttribute(t("placeholder.linkText"))}" />
              </div>
            </div>
            <div class="javaex-editor-dialog-footer">
              <button type="button" class="javaex-editor-dialog-btn javaex-editor-dialog-btn-primary" data-dialog-submit="link">${escapeHtml(t("common.ok"))}</button>
              <button type="button" class="javaex-editor-dialog-btn" data-dialog-close="link">${escapeHtml(t("common.cancel"))}</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-dialog-mask" data-dialog="video">
          <div class="javaex-editor-dialog">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.videoTitle"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="video">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-dialog-content">
              <div class="javaex-editor-form-mode-switch">
                <button type="button" class="active" data-video-mode="url">${escapeHtml(t("dialog.videoUrlMode"))}</button>
                <button type="button" data-video-mode="embed">${escapeHtml(t("dialog.videoEmbedMode"))}</button>
              </div>
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.videoUrl"))}</label>
                <input class="javaex-editor-form-input" data-ref="videoUrl" type="text" placeholder="${escapeAttribute(t("placeholder.videoUrl"))}" />
              </div>
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.videoName"))}</label>
                <input class="javaex-editor-form-input" data-ref="videoTitle" type="text" placeholder="${escapeAttribute(t("placeholder.videoTitle"))}" />
              </div>
              <div class="javaex-editor-form-row" data-ref="videoEmbedRow" hidden>
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.videoEmbed"))}</label>
                <textarea class="javaex-editor-form-input javaex-editor-form-textarea" data-ref="videoEmbedCode" placeholder="${escapeAttribute(t("placeholder.videoEmbed"))}"></textarea>
              </div>
            </div>
            <div class="javaex-editor-dialog-footer">
              <button type="button" class="javaex-editor-dialog-btn javaex-editor-dialog-btn-primary" data-dialog-submit="video">${escapeHtml(t("common.ok"))}</button>
              <button type="button" class="javaex-editor-dialog-btn" data-dialog-close="video">${escapeHtml(t("common.cancel"))}</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-dialog-mask" data-dialog="remote-image">
          <div class="javaex-editor-dialog">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.remoteImageTitle"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="remote-image">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-dialog-content">
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.remoteImageUrl"))}</label>
                <input class="javaex-editor-form-input" data-ref="remoteImageUrl" type="text" placeholder="${escapeAttribute(t("placeholder.remoteImageUrl"))}" />
              </div>
            </div>
            <div class="javaex-editor-dialog-footer">
              <button type="button" class="javaex-editor-dialog-btn javaex-editor-dialog-btn-primary" data-dialog-submit="remote-image">${escapeHtml(t("common.ok"))}</button>
              <button type="button" class="javaex-editor-dialog-btn" data-dialog-close="remote-image">${escapeHtml(t("common.cancel"))}</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-dialog-mask" data-dialog="formula">
          <div class="javaex-editor-dialog">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.formulaTitle"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="formula">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-dialog-content">
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.formulaSource"))}</label>
                <textarea class="javaex-editor-form-input javaex-editor-form-textarea" data-ref="formulaSource" placeholder="${escapeAttribute(t("placeholder.formulaSource"))}"></textarea>
              </div>
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.formulaDisplay"))}</label>
                <select class="javaex-editor-form-input javaex-editor-form-select" data-ref="formulaDisplay">
                  <option value="inline">${escapeHtml(t("dialog.formulaInline"))}</option>
                  <option value="block">${escapeHtml(t("dialog.formulaBlock"))}</option>
                </select>
              </div>
            </div>
            <div class="javaex-editor-dialog-footer">
              <button type="button" class="javaex-editor-dialog-btn javaex-editor-dialog-btn-primary" data-dialog-submit="formula">${escapeHtml(t("common.ok"))}</button>
              <button type="button" class="javaex-editor-dialog-btn" data-dialog-close="formula">${escapeHtml(t("common.cancel"))}</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-dialog-mask" data-dialog="ai-chat">
          <div class="javaex-editor-dialog javaex-editor-dialog-ai-chat">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title">${escapeHtml(t("dialog.aiChatTitle"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="ai-chat">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-dialog-content">
              <div class="javaex-editor-form-row">
                <label class="javaex-editor-form-label">${escapeHtml(t("dialog.aiChatPrompt"))}</label>
                <textarea class="javaex-editor-form-input javaex-editor-form-textarea" data-ref="aiChatPrompt" placeholder="${escapeAttribute(t("placeholder.aiChatPrompt"))}"></textarea>
              </div>
            </div>
            <div class="javaex-editor-dialog-footer">
              <button type="button" class="javaex-editor-dialog-btn javaex-editor-dialog-btn-send" data-dialog-submit="ai-chat-send"><span class="icon" aria-hidden="true">${renderIconSvg("send")}</span><span>${escapeHtml(t("common.send"))}</span></button>
              <button type="button" class="javaex-editor-dialog-btn" data-dialog-close="ai-chat">${escapeHtml(t("common.cancel"))}</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-dialog-mask" data-dialog="color-picker">
          <div class="javaex-editor-dialog javaex-editor-dialog-color-picker">
            <div class="javaex-editor-dialog-top">
              <div class="javaex-editor-dialog-title" data-ref="colorDialogTitle">${escapeHtml(t("colors.dialogTitle"))}</div>
              <button type="button" class="javaex-editor-dialog-close" data-dialog-close="color-picker">${escapeHtml(t("common.close"))}</button>
            </div>
            <div class="javaex-editor-dialog-content">
              <div class="javaex-editor-color-dialog">
                <div class="javaex-editor-color-dialog-board-wrap">
                  <div class="javaex-editor-color-dialog-board" data-ref="colorDialogBoard">
                    <span class="javaex-editor-color-dialog-board-cursor" data-ref="colorDialogBoardCursor"></span>
                  </div>
                </div>
                <div class="javaex-editor-color-dialog-side">
                  <div class="javaex-editor-color-dialog-hue" data-ref="colorDialogHue">
                    <span class="javaex-editor-color-dialog-hue-thumb" data-ref="colorDialogHueThumb"></span>
                  </div>
                  <div class="javaex-editor-color-dialog-fields">
                    <label class="javaex-editor-color-dialog-field">
                      <span>R</span>
                      <input class="javaex-editor-form-input" data-ref="colorDialogR" type="number" min="0" max="255" value="22" />
                    </label>
                    <label class="javaex-editor-color-dialog-field">
                      <span>G</span>
                      <input class="javaex-editor-form-input" data-ref="colorDialogG" type="number" min="0" max="255" value="119" />
                    </label>
                    <label class="javaex-editor-color-dialog-field">
                      <span>B</span>
                      <input class="javaex-editor-form-input" data-ref="colorDialogB" type="number" min="0" max="255" value="255" />
                    </label>
                    <label class="javaex-editor-color-dialog-field javaex-editor-color-dialog-field-hex">
                      <span>#</span>
                      <input class="javaex-editor-form-input" data-ref="colorDialogHex" type="text" maxlength="7" value="#1677ff" />
                    </label>
                    <div class="javaex-editor-color-dialog-preview" data-ref="colorDialogPreview"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="javaex-editor-dialog-footer">
              <button type="button" class="javaex-editor-dialog-btn javaex-editor-dialog-btn-primary" data-dialog-submit="color-picker">${escapeHtml(t("common.ok"))}</button>
              <button type="button" class="javaex-editor-dialog-btn" data-dialog-close="color-picker">${escapeHtml(t("common.cancel"))}</button>
            </div>
          </div>
        </div>

        <div class="javaex-editor-upload-mask" data-ref="uploadMask">
          <div class="javaex-editor-upload-panel">
            <div class="javaex-editor-upload-spinner"></div>
            <div data-ref="uploadText">${escapeHtml(t("tips.imageUploading"))}</div>
          </div>
        </div>

        <div class="javaex-editor-draft-tip" data-ref="draftTip">
          <span>${escapeHtml(t("draft.found"))}</span>
          <button type="button" class="javaex-editor-draft-link blue" data-draft-action="recover">${escapeHtml(t("draft.recover"))}</button>
          <button type="button" class="javaex-editor-draft-link red" data-draft-action="cancel">${escapeHtml(t("draft.cancel"))}</button>
        </div>

        <div class="javaex-editor-tip" data-ref="tip"></div>
      </div>
    `;
  }

  // 缓存渲染完成后的关键 DOM 节点。
  // 后续绝大多数交互都通过这些缓存节点进行，避免反复 querySelector。
  cacheElements() {
    // 首次渲染后，把后续频繁访问的节点都缓存起来，避免重复查询 DOM。
    this.root = this.host.querySelector(".javaex-editor-editor");
    this.toolbar = this.host.querySelector('[data-ref="toolbar"]');
    this.editor = this.host.querySelector('[data-ref="editor"]');
    this.markdownEditor = this.host.querySelector('[data-ref="markdownEditor"]');
    this.editModeSwitch = this.host.querySelector('[data-ref="editModeSwitch"]');
    this.imageInput = this.host.querySelector('[data-ref="imageInput"]');
    this.wordInput = this.host.querySelector('[data-ref="wordInput"]');
    this.emojiGrid = this.host.querySelector('[data-ref="emojiGrid"]');
    this.tablePicker = this.host.querySelector('[data-ref="tablePicker"]');
    this.tableFoot = this.host.querySelector('[data-ref="tableFoot"]');
    this.aiActions = this.host.querySelector('[data-ref="aiActions"]');
    this.tableContextMenu = this.host.querySelector('[data-ref="tableContextMenu"]');
    this.dialogPreviewHtml = this.host.querySelector('[data-ref="dialogPreviewHtml"]');
    this.dialogPreviewMarkdown = this.host.querySelector('[data-ref="dialogPreviewMarkdown"]');
    this.dialogPreviewMarkdownCode = this.host.querySelector('[data-ref="dialogPreviewMarkdownCode"]');
    this.splitPreviewPane = this.host.querySelector('[data-ref="splitPreviewPane"]');
    this.splitPreviewHtml = this.host.querySelector('[data-ref="splitPreviewHtml"]');
    this.splitPreviewMarkdown = this.host.querySelector('[data-ref="splitPreviewMarkdown"]');
    this.splitPreviewMarkdownCode = this.host.querySelector('[data-ref="splitPreviewMarkdownCode"]');
    this.linkHref = this.host.querySelector('[data-ref="linkHref"]');
    this.linkText = this.host.querySelector('[data-ref="linkText"]');
    this.videoUrl = this.host.querySelector('[data-ref="videoUrl"]');
    this.videoTitle = this.host.querySelector('[data-ref="videoTitle"]');
    this.videoEmbedRow = this.host.querySelector('[data-ref="videoEmbedRow"]');
    this.videoEmbedCode = this.host.querySelector('[data-ref="videoEmbedCode"]');
    this.remoteImageUrl = this.host.querySelector('[data-ref="remoteImageUrl"]');
    this.formulaSource = this.host.querySelector('[data-ref="formulaSource"]');
    this.formulaDisplay = this.host.querySelector('[data-ref="formulaDisplay"]');
    this.formulaDisplayOptions = [];
    this.aiChatPrompt = this.host.querySelector('[data-ref="aiChatPrompt"]');
    this.colorDialogTitle = this.host.querySelector('[data-ref="colorDialogTitle"]');
    this.colorDialogBoard = this.host.querySelector('[data-ref="colorDialogBoard"]');
    this.colorDialogBoardCursor = this.host.querySelector('[data-ref="colorDialogBoardCursor"]');
    this.colorDialogHue = this.host.querySelector('[data-ref="colorDialogHue"]');
    this.colorDialogHueThumb = this.host.querySelector('[data-ref="colorDialogHueThumb"]');
    this.colorDialogPreview = this.host.querySelector('[data-ref="colorDialogPreview"]');
    this.colorDialogR = this.host.querySelector('[data-ref="colorDialogR"]');
    this.colorDialogG = this.host.querySelector('[data-ref="colorDialogG"]');
    this.colorDialogB = this.host.querySelector('[data-ref="colorDialogB"]');
    this.colorDialogHex = this.host.querySelector('[data-ref="colorDialogHex"]');
    this.uploadMask = this.host.querySelector('[data-ref="uploadMask"]');
    this.uploadText = this.host.querySelector('[data-ref="uploadText"]');
    this.draftTip = this.host.querySelector('[data-ref="draftTip"]');
    this.tip = this.host.querySelector('[data-ref="tip"]');
    this.menuPanels = new Map(Array.from(this.host.querySelectorAll("[data-menu-panel]")).map((node) => [node.dataset.menuPanel, node]));
    this.dialogs = new Map(Array.from(this.host.querySelectorAll("[data-dialog]")).map((node) => [node.dataset.dialog, node]));
    this.previewDialogMask = this.dialogs.get("preview") || null;
    this.extensionActionMap = new Map();

    this.tablePicker.innerHTML = Array.from({ length: 100 }, (_, index) => {
      const row = Math.floor(index / 10) + 1;
      const col = (index % 10) + 1;
      return `<button type="button" class="javaex-editor-table-picker-cell" data-table-picker="${row}:${col}"></button>`;
    }).join("");

    this.initializeDialogChrome();
    this.initializeFormulaDisplayControl();
    this.promoteDialogMasks();
    this.promoteTableContextMenu();
    this.promoteTipLayer();
    this.renderEmojiGrid(this.options.emojiGroups[0]?.key || defaultEmojiGroups[0].key);
    this.renderAiActions();
    this.updateEditModeButtons();
  }

  // 统一处理弹窗关闭按钮的展示和无障碍属性。
  initializeDialogChrome() {
    Array.from(this.host.querySelectorAll(".javaex-editor-dialog-close")).forEach((button) => {
      button.textContent = "×";
      button.setAttribute("aria-label", this.t("common.close"));
      button.setAttribute("title", this.t("common.close"));
    });
  }

  // 把数学公式弹窗中的原始 select 增强成单选按钮组。
  // 这样样式可控性更高，也更符合“行内公式 / 块级公式”的切换心智。
  initializeFormulaDisplayControl() {
    if (!this.formulaDisplay || this.formulaDisplay.dataset.enhanced === "true") {
      this.formulaDisplayOptions = Array.from(this.host.querySelectorAll("[data-formula-display]"));
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "javaex-editor-form-radio-group";
    wrapper.innerHTML = `
      <label class="javaex-editor-form-radio">
        <input type="radio" name="formulaDisplay-${escapeAttribute(this.options.editorId)}" data-formula-display value="inline" checked />
        <span>${escapeHtml(this.t("dialog.formulaInline"))}</span>
      </label>
      <label class="javaex-editor-form-radio">
        <input type="radio" name="formulaDisplay-${escapeAttribute(this.options.editorId)}" data-formula-display value="block" />
        <span>${escapeHtml(this.t("dialog.formulaBlock"))}</span>
      </label>
    `;

    this.formulaDisplay.replaceWith(wrapper);
    this.formulaDisplayOptions = Array.from(wrapper.querySelectorAll("[data-formula-display]"));
    this.formulaDisplay = null;
  }

  // 把所有弹窗蒙层挂到 document.body 下。
  // 这样可以避免被编辑器容器的层级、滚动、裁切等样式影响。
  promoteDialogMasks() {
    this.boundDialogMaskClick = (event) => {
      const mask = event.currentTarget;
      const target = event.target;

      const videoModeButton = target.closest("[data-video-mode]");
      if (videoModeButton) {
        event.preventDefault();
        this.setVideoDialogMode(videoModeButton.dataset.videoMode || "url");
        return;
      }

      if (target === mask) {
        this.closeDialog(mask.dataset.dialog);
        return;
      }

      const dialogClose = target.closest("[data-dialog-close]");
      if (dialogClose) {
        event.preventDefault();
        this.closeDialog(dialogClose.dataset.dialogClose);
        return;
      }

      const dialogSubmit = target.closest("[data-dialog-submit]");
      if (dialogSubmit) {
        event.preventDefault();
        this.submitDialog(dialogSubmit.dataset.dialogSubmit);
      }
    };

    this.dialogs.forEach((mask) => {
      if (mask.dataset.portalMounted === "true") {
        return;
      }
      mask.dataset.portalMounted = "true";
      mask.addEventListener("click", this.boundDialogMaskClick);
      document.body.appendChild(mask);
    });
  }

  // 表格右键菜单单独提升到 body，便于按视口坐标精确定位。
  promoteTableContextMenu() {
    if (!this.tableContextMenu || this.tableContextMenu.dataset.portalMounted === "true") {
      return;
    }
    this.tableContextMenu.dataset.portalMounted = "true";
    this.tableContextMenu.style.position = "fixed";
    document.body.appendChild(this.tableContextMenu);
  }

  // 轻提示层提升到 body，避免在全屏或滚动容器中被遮挡。
  promoteTipLayer() {
    if (!this.tip || this.tip.dataset.portalMounted === "true") {
      return;
    }
    this.tip.dataset.portalMounted = "true";
    document.body.appendChild(this.tip);
  }

  // 绑定编辑器运行时需要的全部事件。
  // 所有绑定后的回调都会挂到实例属性上，便于 destroy 时统一卸载。
  bindEvents() {
    // 统一先把处理函数绑定到实例属性上，destroy 时可以完整移除。
    this.boundRootMouseDown = (event) => this.handleRootMouseDown(event);
    this.boundRootClick = (event) => this.handleRootClick(event);
    this.boundRootInput = (event) => this.handleRootInput(event);
    this.boundDocumentClick = (event) => this.handleDocumentClick(event);
    this.boundSelectionChange = () => this.handleSelectionChange();
    this.boundEditorInput = () => this.handleEditorInput();
    this.boundEditorPaste = (event) => this.handleEditorPaste(event);
    this.boundEditorSelection = () => this.saveSelection();
    this.boundMarkdownInput = () => this.syncOutput();
    this.boundTableHover = (event) => this.handleTableHover(event);
    this.boundTableContextClick = (event) => this.handleTableContextClick(event);
    this.boundImageChange = (event) => this.handleImageChange(event);
    this.boundWordChange = (event) => this.handleWordImportChange(event);
    this.boundColorDialogInput = (event) => this.handleColorDialogInput(event);
    this.boundColorDialogMouseDown = (event) => this.handleColorDialogMouseDown(event);
    this.boundColorDialogMouseMove = (event) => this.handleColorDialogMouseMove(event);
    this.boundColorDialogMouseUp = () => this.stopColorDialogDrag();
    this.boundContextMenu = (event) => this.handleContextMenu(event);
    this.boundWindowUpdate = () => {
      this.repositionActiveMenu();
      this.hideTableContextMenu();
    };
    this.boundWindowKeydown = (event) => this.handleWindowKeydown(event);
    this.boundFullscreenChange = () => this.handleFullscreenChange();

    this.host.addEventListener("mousedown", this.boundRootMouseDown, true);
    this.host.addEventListener("click", this.boundRootClick);
    this.host.addEventListener("input", this.boundRootInput);
    this.editor.addEventListener("input", this.boundEditorInput);
    this.editor.addEventListener("paste", this.boundEditorPaste);
    this.editor.addEventListener("mouseup", this.boundEditorSelection);
    this.editor.addEventListener("keyup", this.boundEditorSelection);
    this.editor.addEventListener("focus", this.boundEditorSelection);
    this.markdownEditor.addEventListener("input", this.boundMarkdownInput);
    this.editor.addEventListener("contextmenu", this.boundContextMenu);
    this.tablePicker.addEventListener("mouseover", this.boundTableHover);
    this.tableContextMenu.addEventListener("click", this.boundTableContextClick);
    this.imageInput.addEventListener("change", this.boundImageChange);
    this.wordInput.addEventListener("change", this.boundWordChange);
    this.colorDialogBoard.addEventListener("mousedown", this.boundColorDialogMouseDown);
    this.colorDialogHue.addEventListener("mousedown", this.boundColorDialogMouseDown);
    this.colorDialogR.addEventListener("input", this.boundColorDialogInput);
    this.colorDialogG.addEventListener("input", this.boundColorDialogInput);
    this.colorDialogB.addEventListener("input", this.boundColorDialogInput);
    this.colorDialogHex.addEventListener("input", this.boundColorDialogInput);
    document.addEventListener("mousemove", this.boundColorDialogMouseMove);
    document.addEventListener("mouseup", this.boundColorDialogMouseUp);
    document.addEventListener("click", this.boundDocumentClick);
    document.addEventListener("selectionchange", this.boundSelectionChange);
    document.addEventListener("fullscreenchange", this.boundFullscreenChange);
    window.addEventListener("resize", this.boundWindowUpdate);
    window.addEventListener("scroll", this.boundWindowUpdate, true);
    window.addEventListener("keydown", this.boundWindowKeydown);
  }

  // 编辑器根节点点击分发器。
  // 工具栏按钮、菜单项、弹窗按钮、草稿提示等入口都会先经过这里再路由到具体逻辑。
  handleRootClick(event) {
    const target = event.target;

    if (target.classList?.contains("javaex-editor-dialog-mask")) {
      this.closeDialog(target.dataset.dialog);
      return;
    }

    const menuToggle = target.closest("[data-menu-toggle]");
    if (menuToggle) {
      event.preventDefault();
      if (this.currentEditMode === "markdown" && menuToggle.dataset.menuToggle !== "ai") {
        this.showTip(this.t("tips.markdownOnly"), true);
        return;
      }
      if (this.currentEditMode === "html") {
        this.saveSelection();
      }
      this.toggleMenu(menuToggle.dataset.menuToggle, menuToggle);
      return;
    }

    const editModeButton = target.closest("[data-edit-mode]");
    if (editModeButton) {
      event.preventDefault();
      this.setEditMode(editModeButton.dataset.editMode);
      return;
    }

    const tool = target.closest("[data-tool]");
    if (tool) {
      event.preventDefault();
      if (this.currentEditMode === "html") {
        this.saveSelection();
      }
      this.handleTool(tool.dataset.tool);
      return;
    }

    const menuAction = target.closest("[data-menu-action]");
    if (menuAction) {
      event.preventDefault();
      this.handleMenuAction(menuAction);
      return;
    }

    const emojiTab = target.closest("[data-emoji-tab]");
    if (emojiTab) {
      event.preventDefault();
      this.renderEmojiGrid(emojiTab.dataset.emojiTab);
      return;
    }

    const emojiItem = target.closest("[data-emoji-value]");
    if (emojiItem) {
      event.preventDefault();
      if (emojiItem.dataset.emojiType === "image") {
        const src = emojiItem.dataset.emojiValue;
        const alt = emojiItem.dataset.emojiLabel || this.t("emoji.alt");
        this.insertHtml(`<img class="javaex-editor-meme-emoji" src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`);
      } else {
        this.insertHtml(escapeHtml(emojiItem.dataset.emojiValue));
      }
      this.closeMenus();
      return;
    }

    const videoModeButton = target.closest("[data-video-mode]");
    if (videoModeButton) {
      event.preventDefault();
      this.setVideoDialogMode(videoModeButton.dataset.videoMode || "url");
      return;
    }

    const tablePickerCell = target.closest("[data-table-picker]");
    if (tablePickerCell) {
      event.preventDefault();
      const [rows, cols] = tablePickerCell.dataset.tablePicker.split(":").map(Number);
      this.insertTable(rows, cols);
      return;
    }

    const previewTab = target.closest("[data-preview-tab]");
    if (previewTab) {
      event.preventDefault();
      this.setPreviewTab(previewTab.dataset.previewTab, previewTab.closest(".javaex-editor-dialog-mask, .javaex-editor-preview-pane"));
      return;
    }

    const dialogSubmit = target.closest("[data-dialog-submit]");
    if (dialogSubmit) {
      event.preventDefault();
      this.submitDialog(dialogSubmit.dataset.dialogSubmit);
      return;
    }

    const dialogClose = target.closest("[data-dialog-close]");
    if (dialogClose) {
      event.preventDefault();
      this.closeDialog(dialogClose.dataset.dialogClose);
      return;
    }

    const closePreview = target.closest("[data-close-preview]");
    if (closePreview) {
      event.preventDefault();
      this.closeSplitPreview();
      return;
    }

    const draftAction = target.closest("[data-draft-action]");
    if (draftAction) {
      event.preventDefault();
      if (draftAction.dataset.draftAction === "recover") {
        this.recoverDraft();
      } else {
        this.cancelDraftNotice();
      }
      return;
    }

    this.closeMenus();
    this.hideTableContextMenu();
  }

  // 在工具栏和菜单区域阻止默认 mousedown。
  // 否则浏览器会先清空编辑区原有选区，导致后续格式命令找不到正确光标。
  handleRootMouseDown(event) {
    // 点击工具栏按钮时阻止默认行为，避免浏览器把编辑区原本的选区清掉。
    const target = event.target;
    if (target.closest(".javaex-editor-body-container")) {
      return;
    }
    if (target.closest(".javaex-editor-markdown-editor")) {
      return;
    }
    if (target.closest(".javaex-editor-form-input") || target.closest(".javaex-editor-form-textarea") || target.closest(".javaex-editor-form-select")) {
      return;
    }
    if (
      target.closest("button") ||
      target.closest("[data-menu-action]") ||
      target.closest("[data-menu-toggle]") ||
      target.closest("[data-tool]") ||
      target.closest("[data-emoji-tab]") ||
      target.closest("[data-emoji-value]") ||
      target.closest("[data-table-picker]") ||
      target.closest("[data-preview-tab]") ||
      target.closest("[data-dialog-submit]") ||
      target.closest("[data-dialog-close]") ||
      target.closest("[data-close-preview]") ||
      target.closest("[data-draft-action]")
    ) {
      event.preventDefault();
    }
  }

  // 点击编辑器外部时，关闭所有浮层菜单和表格右键菜单。
  handleDocumentClick(event) {
    if (!this.host.contains(event.target) && !this.tableContextMenu.contains(event.target)) {
      this.closeMenus();
      this.hideTableContextMenu();
    }
  }

  // 监听浏览器全局选区变化。
  // 只有选区仍在当前编辑器内部时，才会保存选区并刷新工具栏高亮状态。
  handleSelectionChange() {
    if (this.currentEditMode !== "html") {
      return;
    }
    const range = getSelectionRange();
    if (!range || !this.editor.contains(range.commonAncestorContainer)) {
      return;
    }
    this.saveSelection();
    this.syncToolbarSelectionState(range);
    this.updateActiveStates();
  }

  // HTML 编辑区输入后的统一入口。
  // 这里会先把空内容标准化，再同步输出给预览、回调和草稿存储。
  handleEditorInput() {
    this.normalizeEditorEmptyState();
    this.syncToolbarSelectionState();
    this.syncOutput();
  }

  // 代码块里粘贴内容时必须按纯文本处理。
  // Eclipse 等 IDE 会同时写入 text/html，浏览器默认粘贴 HTML 时可能丢掉源码换行。
  handleEditorPaste(event) {
    if (this.currentEditMode !== "html") {
      return;
    }

    const range = getSelectionRange();
    const codeBlock = range ? this.findClosestCodeBlock(range.startContainer) : null;
    if (!codeBlock || !this.isRangeInsideCodeBlock(range, codeBlock)) {
      setTimeout(() => this.handleEditorInput(), 0);
      return;
    }

    const text = this.getClipboardCodeText(event.clipboardData);
    if (text === null) {
      setTimeout(() => this.handleEditorInput(), 0);
      return;
    }

    event.preventDefault();
    this.insertPlainTextInCodeBlock(range, text);
    this.afterMutation();
  }

  // 表格尺寸选择面板的 hover 逻辑：实时高亮当前拖拽到的行列范围。
  handleTableHover(event) {
    const cell = event.target.closest("[data-table-picker]");
    if (!cell) {
      return;
    }
    const [rows, cols] = cell.dataset.tablePicker.split(":").map(Number);
    this.tableFoot.textContent = `${rows} x ${cols}`;
    Array.from(this.tablePicker.querySelectorAll("[data-table-picker]")).forEach((node) => {
      const [row, col] = node.dataset.tablePicker.split(":").map(Number);
      node.classList.toggle("active", row <= rows && col <= cols);
    });
  }

  // 处理表格单元格上的右键菜单。
  // 只有在 HTML 模式并且右键目标位于表格单元格内时，才会弹出表格菜单。
  handleContextMenu(event) {
    if (this.currentEditMode !== "html") {
      this.hideTableContextMenu();
      return;
    }
    const cell = this.findClosestTag(event.target, ["TD", "TH"]);
    if (!cell || !this.editor.contains(cell)) {
      this.hideTableContextMenu();
      return;
    }

    event.preventDefault();
    this.activeTableCell = cell;
    this.updateTableContextState();
    this.tableContextMenu.classList.add("is-open");
    this.tableContextMenu.style.visibility = "hidden";
    this.tableContextMenu.style.left = "0px";
    this.tableContextMenu.style.top = "0px";
    const width = this.tableContextMenu.offsetWidth || 188;
    const height = this.tableContextMenu.offsetHeight || 280;
    const left = clamp(event.clientX + 6, 8, Math.max(8, window.innerWidth - width - 8));
    const preferredTop = event.clientY + 8;
    const fallbackTop = event.clientY - height - 8;
    const top = preferredTop + height > window.innerHeight - 8
      ? Math.max(8, fallbackTop)
      : Math.min(preferredTop, Math.max(8, window.innerHeight - height - 8));
    this.tableContextMenu.style.left = `${left}px`;
    this.tableContextMenu.style.top = `${top}px`;
    this.tableContextMenu.style.visibility = "";
  }

  // 处理工具栏按钮点击。
  // 这里只负责“按钮到命令”的路由分发，具体执行逻辑会进入对应方法。
  handleTool(key) {
    const toolbarExtension = this.toolbarExtensionMap.get(key);
    if (toolbarExtension) {
      this.runToolbarExtension(key);
      return;
    }

    if (this.currentEditMode === "markdown" && !["preview", "ai", "importWord", "fullscreen"].includes(key)) {
      this.showTip(this.t("tips.markdownOnly"), true);
      return;
    }

    if (!["image", "table", "emoji", "ai", "foreColor", "backColor"].includes(key)) {
      this.closeMenus();
    }

    switch (key) {
      case "undo":
        this.exec("undo");
        break;
      case "redo":
        this.exec("redo");
        break;
      case "bold":
        this.toggleInlineFormat("bold");
        break;
      case "italic":
        this.toggleInlineFormat("italic");
        break;
      case "underline":
        this.toggleInlineFormat("underline");
        break;
      case "strike":
        this.toggleInlineFormat("strike");
        break;
      case "superscript":
        this.exec("superscript");
        break;
      case "subscript":
        this.exec("subscript");
        break;
      case "video":
        this.openVideoDialog();
        break;
      case "importWord":
        this.wordInput.click();
        break;
      case "fullscreen":
        this.toggleFullscreen();
        break;
      case "link":
        this.openLinkDialog();
        break;
      case "unlink":
        this.exec("unlink");
        break;
      case "hr":
        this.insertHtml("<hr /><p><br /></p>");
        break;
      case "selectAll":
        this.selectAll();
        break;
      case "removeFormat":
        this.exec("removeFormat");
        break;
      case "indent":
        this.adjustIndent(32);
        break;
      case "outdent":
        this.adjustIndent(-32);
        break;
      case "justifyLeft":
        this.exec("justifyLeft");
        break;
      case "justifyCenter":
        this.exec("justifyCenter");
        break;
      case "justifyRight":
        this.exec("justifyRight");
        break;
      case "orderedList":
        this.exec("insertOrderedList");
        break;
      case "unorderedList":
        this.exec("insertUnorderedList");
        break;
      case "quote":
        this.insertHtml(`<blockquote>${escapeHtml(this.t("insert.quote"))}</blockquote><p><br /></p>`);
        break;
      case "code":
        this.insertHtml('<pre><code class="hljs"><br /></code></pre><p><br /></p>');
        break;
      case "formula":
        this.openFormulaDialog();
        break;
      case "preview":
        this.openPreview("preview");
        break;
      default:
        break;
    }
  }

  // 处理下拉面板、颜色面板、AI 面板里的菜单项点击。
  handleMenuAction(node) {
    const action = node.dataset.menuAction;

    if (this.currentEditMode === "markdown" && action !== "ai") {
      this.closeMenus();
      this.showTip(this.t("tips.markdownOnly"), true);
      return;
    }

    if (action === "font") {
      this.setLabel("font", node.dataset.label);
      this.closeMenus();
      this.applyInlineStyle({ "font-family": node.dataset.value });
      return;
    }

    if (action === "size") {
      this.setLabel("size", node.dataset.label);
      this.closeMenus();
      this.applyInlineStyle({ "font-size": node.dataset.value });
      return;
    }

    if (action === "format") {
      this.setLabel("format", node.dataset.label);
      this.closeMenus();
      this.applyFormat(node.dataset.value);
      return;
    }

    if (action === "foreColor") {
      this.closeMenus();
      if (node.dataset.reset === "true") {
        this.selectedForeColor = "";
        this.clearInlineStyle(["color"], { preserveSelection: true });
      } else {
        this.selectedForeColor = node.dataset.value;
        this.applyInlineStyle({ color: node.dataset.value }, { preserveSelection: true });
      }
      this.updateColorIndicators();
      return;
    }

    if (action === "foreColor-palette-toggle") {
      this.openColorPickerDialog("foreColor");
      return;
    }

    if (action === "backColor") {
      this.closeMenus();
      if (node.dataset.reset === "true") {
        this.selectedBackColor = "";
        this.clearInlineStyle(["background-color"], { preserveSelection: true });
      } else {
        this.selectedBackColor = node.dataset.value;
        this.applyInlineStyle({ "background-color": node.dataset.value }, { preserveSelection: true });
      }
      this.updateColorIndicators();
      return;
    }

    if (action === "backColor-palette-toggle") {
      this.openColorPickerDialog("backColor");
      return;
    }

    if (action === "image-source") {
      this.closeMenus();
      if (node.dataset.value === "local") {
        this.imageInput.click();
      } else {
        this.openRemoteImageDialog();
      }
      return;
    }

    if (action === "table-action") {
      this.handleTableAction(node.dataset.value);
      return;
    }

    if (action === "ai") {
      this.closeMenus();
      if (node.dataset.value === "chat") {
        this.openAiChatDialog();
      } else {
        this.runAiAction(node.dataset.value);
      }
    }
  }

  // 切换某个浮层菜单的显示状态，并记录触发它的锚点按钮。
  toggleMenu(name, anchor) {
    if (this.activeMenu === name) {
      this.closeMenus();
      return;
    }

    this.closeMenus();
    this.activeMenu = name;
    this.activeAnchor = anchor;
    const panel = this.menuPanels.get(name);
    if (!panel) {
      return;
    }
    panel.classList.add("is-open");
    anchor.closest(".javaex-editor-combobox")?.classList.add("is-active");
    anchor.closest(".javaex-editor-tool")?.classList.add("is-active");
    this.positionMenu(panel, anchor);
  }

  // 计算菜单面板在视口中的位置。
  // 默认显示在按钮下方，空间不足时自动翻到上方，并做左右边界裁剪。
  positionMenu(panel, anchor) {
    // 菜单默认显示在按钮下方；如果空间不够，则自动翻到上方。
    const rect = anchor.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    let width = panel.offsetWidth || 180;
    let height = panel.offsetHeight || 120;

    if (width >= window.innerWidth - 24) {
      panel.style.visibility = "hidden";
      panel.style.left = "-9999px";
      panel.style.top = "-9999px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.width = "max-content";
      panel.style.maxWidth = `${Math.max(160, window.innerWidth - 16)}px`;
      width = panel.offsetWidth || width;
      height = panel.offsetHeight || height;
    } else {
      panel.style.width = "";
      panel.style.maxWidth = "";
    }

    const maxLeft = Math.max(8, window.innerWidth - rootRect.left - width - 8);
    const preferredLeft = rect.left - rootRect.left;
    const preferredTop = rect.bottom - rootRect.top + 8;
    const fallbackTop = rect.top - rootRect.top - height - 8;
    const maxTop = Math.max(8, window.innerHeight - rootRect.top - height - 8);
    const left = clamp(preferredLeft, 8, maxLeft);
    const top = clamp(preferredTop + height > maxTop + 8 ? fallbackTop : preferredTop, 8, maxTop);

    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.visibility = "";
  }

  // 窗口滚动或尺寸变化后，重新计算当前打开菜单的位置。
  repositionActiveMenu() {
    if (!this.activeMenu || !this.activeAnchor) {
      return;
    }
    const panel = this.menuPanels.get(this.activeMenu);
    if (panel) {
      this.positionMenu(panel, this.activeAnchor);
    }
  }

  // 关闭所有工具栏菜单，并清理掉按钮上的激活样式。
  closeMenus() {
    this.activeMenu = "";
    this.activeAnchor = null;
    this.menuPanels.forEach((panel) => panel.classList.remove("is-open"));
    Array.from(this.host.querySelectorAll(".javaex-editor-tool.is-active, .javaex-editor-combobox.is-active")).forEach((node) => node.classList.remove("is-active"));
  }

  // 打开指定弹窗。
  // 在打开前会先保存当前选区，保证弹窗提交后还能把内容插回原位置。
  openDialog(name) {
    this.closeMenus();
    if (this.savedRange) {
      this.dialogSelectionRange = this.savedRange.cloneRange();
    }
    this.dialogs.get(name)?.classList.add("is-open");
  }

  // 关闭指定弹窗，并在必要时清理插入锚点。
  closeDialog(name) {
    this.dialogs.get(name)?.classList.remove("is-open");
    if (name === "formula") {
      this.removeFormulaAnchor(true);
    }
    if (name === "remote-image") {
      this.removeRemoteImageAnchor(true);
    }
  }

  // 打开超链接弹窗，并尽量回填当前链接或选中文本的信息。
  openLinkDialog() {
    const anchorNode = this.savedRange?.commonAncestorContainer || window.getSelection()?.anchorNode || null;
    const linkNode = this.findClosestTag(anchorNode, ["A"]);
    this.linkHref.value = linkNode?.getAttribute("href") || "";
    this.linkText.value = this.savedRange?.toString() || linkNode?.textContent?.trim() || "";
    this.openDialog("link");
  }

  // 打开视频弹窗，同时重置上一次输入的临时数据。
  openVideoDialog() {
    this.videoUrl.value = "";
    this.videoTitle.value = "";
    this.videoEmbedCode.value = "";
    this.setVideoDialogMode("url");
    this.openDialog("video");
  }

  // 打开数学公式弹窗。
  // 这里会先在原光标位置插入一个隐藏锚点，稍后公式提交时再回到该位置插入。
  openFormulaDialog() {
    this.saveFormulaAnchor();
    if (this.savedRange) {
      this.dialogSelectionRange = this.savedRange.cloneRange();
    }
    this.formulaSource.value = "";
    this.formulaDisplayOptions.forEach((input) => {
      input.checked = input.value === "inline";
    });
    this.openDialog("formula");
  }

  // 打开“远程图片”弹窗，并提前在原光标位置打一个锚点。
  openRemoteImageDialog() {
    this.saveRemoteImageAnchor();
    this.remoteImageUrl.value = "";
    this.openDialog("remote-image");
  }

  // 打开 AI 对话弹窗。
  // 如果当前有选区，会记录该选区范围，便于 AI 返回结果后局部替换。
  openAiChatDialog() {
    const selection = this.getSelectedContentPayload();
    this.aiChatRange = selection.html && this.savedRange ? this.savedRange.cloneRange() : null;
    this.aiChatPrompt.value = "";
    this.aiChatResult = "";
    this.openDialog("ai-chat");
  }

  // 处理根节点上的 input 事件。
  // 当前主要承接颜色面板中输入框与颜色选择器之间的双向同步。
  handleRootInput(event) {
    const colorPicker = event.target.closest?.("[data-color-picker]");
    if (colorPicker) {
      const action = colorPicker.dataset.colorPicker;
      const hexInput = this.host.querySelector(`[data-color-hex="${action}"]`);
      if (hexInput) {
        hexInput.value = colorPicker.value;
      }
      this.applyCustomColor(action, colorPicker.value);
      return;
    }

    const colorHex = event.target.closest?.("[data-color-hex]");
    if (colorHex) {
      const action = colorHex.dataset.colorHex;
      const normalized = normalizeHexColor(colorHex.value, "");
      const colorPickerInput = this.host.querySelector(`[data-color-picker="${action}"]`);
      if (normalized && colorPickerInput) {
        colorPickerInput.value = normalized;
      }
    }
  }

  // 处理表格右键菜单项点击。
  handleTableContextClick(event) {
    const item = event.target.closest("[data-menu-action='table-action']");
    if (!item || item.disabled) {
      return;
    }
    event.preventDefault();
    this.handleTableAction(item.dataset.value);
  }

  // 打开高级颜色选择弹窗，并根据当前目标（字体色/背景色）初始化面板状态。
  openColorPickerDialog(action) {
    this.currentColorDialogTarget = action === "backColor" ? "backColor" : "foreColor";
    const currentColor = this.currentColorDialogTarget === "backColor"
      ? (normalizeHexColor(this.selectedBackColor || "#fff799", "#fff799"))
      : (normalizeHexColor(this.selectedForeColor || "#1677ff", "#1677ff"));
    this.colorDialogTitle.textContent = this.currentColorDialogTarget === "backColor" ? this.t("dialog.colorBackTitle") : this.t("dialog.colorForeTitle");
    this.setColorDialogValue(currentColor);
    this.openDialog("color-picker");
  }

  // 用一个确定的颜色值初始化颜色弹窗的各项输入状态。
  setColorDialogValue(color) {
    const hex = normalizeHexColor(color, "#1677ff");
    const { r, g, b } = hexToRgb(hex);
    const { h, s, v } = rgbToHsv(r, g, b);
    this.colorDialogState = { h, s, v };
    this.colorDialogHex.value = hex;
    this.colorDialogR.value = String(r);
    this.colorDialogG.value = String(g);
    this.colorDialogB.value = String(b);
    this.colorDialogPreview.style.background = hex;
    this.syncColorDialogUi();
  }

  // 把颜色弹窗内部的 HSV 状态同步到色板、色相条和预览块 UI。
  syncColorDialogUi() {
    if (!this.colorDialogBoard) {
      return;
    }
    const { h, s, v } = this.colorDialogState;
    const hueRgb = hsvToRgb(h, 100, 100);
    this.colorDialogBoard.style.setProperty("--javaex-editor-picker-hue", rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b));
    this.colorDialogBoardCursor.style.left = `${clamp(s, 0, 100)}%`;
    this.colorDialogBoardCursor.style.top = `${100 - clamp(v, 0, 100)}%`;
    this.colorDialogHueThumb.style.top = `${(clamp(h, 0, 359.99) / 360) * 100}%`;
  }

  // 局部更新颜色弹窗状态，并把 H/S/V 重新同步回 RGB/HEX 输入框。
  setColorDialogState(nextState) {
    this.colorDialogState = {
      h: clamp(Number(nextState.h ?? this.colorDialogState.h) || 0, 0, 359.99),
      s: clamp(Number(nextState.s ?? this.colorDialogState.s) || 0, 0, 100),
      v: clamp(Number(nextState.v ?? this.colorDialogState.v) || 0, 0, 100)
    };
    const { r, g, b } = hsvToRgb(this.colorDialogState.h, this.colorDialogState.s, this.colorDialogState.v);
    const hex = rgbToHex(r, g, b);
    this.colorDialogHex.value = hex;
    this.colorDialogR.value = String(r);
    this.colorDialogG.value = String(g);
    this.colorDialogB.value = String(b);
    this.colorDialogPreview.style.background = hex;
    this.syncColorDialogUi();
  }

  // 颜色弹窗拖拽开始：判断当前操作的是色板还是色相条。
  handleColorDialogMouseDown(event) {
    const board = event.target.closest("[data-ref='colorDialogBoard']");
    const hue = event.target.closest("[data-ref='colorDialogHue']");
    if (!board && !hue) {
      return;
    }
    event.preventDefault();
    this.colorDialogDragType = board ? "board" : "hue";
    if (board) {
      this.updateColorDialogBoard(event);
    } else {
      this.updateColorDialogHue(event);
    }
  }

  // 颜色弹窗拖拽中：根据拖拽目标持续更新颜色状态。
  handleColorDialogMouseMove(event) {
    if (!this.colorDialogDragType) {
      return;
    }
    event.preventDefault();
    if (this.colorDialogDragType === "board") {
      this.updateColorDialogBoard(event);
    } else {
      this.updateColorDialogHue(event);
    }
  }

  // 结束颜色拖拽状态。
  stopColorDialogDrag() {
    this.colorDialogDragType = "";
  }

  // 根据鼠标在色板中的坐标计算饱和度与明度。
  updateColorDialogBoard(event) {
    const rect = this.colorDialogBoard.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    this.setColorDialogState({
      s: (x / rect.width) * 100,
      v: 100 - (y / rect.height) * 100
    });
  }

  // 根据鼠标在色相条中的纵向位置计算色相值。
  updateColorDialogHue(event) {
    const rect = this.colorDialogHue.getBoundingClientRect();
    if (!rect.height) {
      return;
    }
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    this.setColorDialogState({
      h: Math.min(359.99, (y / rect.height) * 360)
    });
  }

  // 处理颜色弹窗中的输入框变化。
  // HEX 直接转颜色，RGB 三个输入框在都合法时再合并计算。
  handleColorDialogInput(event) {
    const target = event.target;
    if (target === this.colorDialogHex) {
      const hex = normalizeHexColor(target.value, "");
      if (hex) {
        this.setColorDialogValue(hex);
      }
      return;
    }

    if (![this.colorDialogR, this.colorDialogG, this.colorDialogB].includes(target)) {
      return;
    }

    const hasBlankValue = [this.colorDialogR, this.colorDialogG, this.colorDialogB].some((input) => input.value === "");
    if (hasBlankValue) {
      return;
    }

    const hex = rgbToHex(this.colorDialogR.value, this.colorDialogG.value, this.colorDialogB.value);
    this.setColorDialogValue(hex);
  }

  // 应用自定义颜色到当前选区或当前待输入状态，并更新工具栏图标颜色。
  applyCustomColor(action, value) {
    const color = normalizeHexColor(value, "");
    if (!color) {
      this.showTip(this.t("tips.invalidColor"), true);
      return;
    }

    if (action === "foreColor") {
      this.selectedForeColor = color;
      this.applyInlineStyle({ color }, { preserveSelection: true });
    } else {
      this.selectedBackColor = color;
      this.applyInlineStyle({ "background-color": color }, { preserveSelection: true });
    }
    this.updateColorIndicators();
  }

  // 切换视频弹窗的两种输入模式：视频地址 / 嵌入代码。
  setVideoDialogMode(mode) {
    this.currentVideoMode = mode === "embed" ? "embed" : "url";
    const videoDialog = this.dialogs.get("video");
    Array.from(videoDialog?.querySelectorAll("[data-video-mode]") || []).forEach((button) => {
      button.classList.toggle("active", button.dataset.videoMode === this.currentVideoMode);
    });
    if (this.videoEmbedRow) {
      this.videoEmbedRow.hidden = this.currentVideoMode !== "embed";
    }
    if (this.videoUrl) {
      this.videoUrl.closest(".javaex-editor-form-row").hidden = this.currentVideoMode !== "url";
    }
    if (this.videoTitle) {
      this.videoTitle.closest(".javaex-editor-form-row").hidden = this.currentVideoMode !== "url";
    }
  }

  // 统一处理各类弹窗“确定/发送”动作。
  // 不同弹窗在这里根据 name 分支执行各自的提交逻辑。
  async submitDialog(name) {
    if (name === "link") {
      const href = this.linkHref.value.trim();
      if (!href) {
        this.showTip(this.t("tips.linkRequired"), true);
        return;
      }
      const text = (this.linkText.value || href).trim();
      this.restoreDialogSelection();
      this.insertHtml(`<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`);
      this.closeDialog("link");
      return;
    }

    if (name === "video") {
      this.restoreDialogSelection();
      if (this.currentVideoMode === "embed") {
        const embedCode = this.videoEmbedCode.value.trim();
        if (!embedCode) {
          this.showTip(this.t("tips.videoEmbedRequired"), true);
          return;
        }
        const embedHtml = embedCode.includes("<")
          ? sanitizeHtml(embedCode)
          : `<iframe src="${escapeAttribute(embedCode)}" frameborder="0" allowfullscreen></iframe>`;
        this.insertHtml(`<div class="javaex-editor-edit-video javaex-editor-edit-embed">${embedHtml}</div><p><br /></p>`);
      } else {
        const url = this.videoUrl.value.trim();
        const title = this.videoTitle.value.trim();
        if (!url) {
          this.showTip(this.t("tips.videoUrlRequired"), true);
          return;
        }
        this.insertHtml(`<figure class="javaex-editor-edit-video"><video controls width="640" height="400" src="${escapeAttribute(url)}" title="${escapeAttribute(title)}">${escapeHtml(this.t("insert.videoUnsupported"))}</video>${title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ""}</figure><p><br /></p>`);
      }
      this.closeDialog("video");
      return;
    }

    if (name === "remote-image") {
      const url = this.remoteImageUrl.value.trim();
      if (!url) {
        this.showTip(this.t("tips.remoteImageRequired"), true);
        return;
      }
      const imageHtml = `<figure class="javaex-editor-edit-image"><img src="${escapeAttribute(url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></figure>`;
      if (!this.insertHtmlAtRemoteImageAnchor(imageHtml)) {
        this.restoreDialogSelection();
        this.insertHtml(imageHtml);
      }
      this.remoteImageUrl.value = "";
      this.closeDialog("remote-image");
      this.showTip(this.t("tips.remoteImageInserted"));
      return;
    }

    if (name === "formula") {
      const source = this.formulaSource.value.trim();
      const display = this.formulaDisplayOptions.find((input) => input.checked)?.value === "block" ? "block" : "inline";
      if (!source) {
        this.showTip(this.t("tips.formulaRequired"), true);
        return;
      }

      try {
        const renderer = this.options.formula?.render;
        const payload = {
          source,
          display,
          html: this.getHtml(),
          text: this.getText(),
          markdown: this.getMarkdown()
        };

        if (typeof renderer === "function") {
          this.restoreDialogSelection();
          const result = await renderer(payload, this.createContext());
          if (typeof result === "string" && result.trim()) {
            if (!this.insertHtmlAtFormulaAnchor(result)) {
              this.restoreDialogSelection();
              this.insertHtml(result);
            }
          }
        } else {
          const formulaHtml = `<span class="javaex-editor-formula${display === "block" ? " javaex-editor-formula-block" : ""}" contenteditable="false" data-formula="${escapeAttribute(source)}" data-display="${display}"><span class="javaex-editor-formula-code">${escapeHtml(display === "block" ? `\\[${source}\\]` : `\\(${source}\\)`)}</span></span>`;
          const html = display === "block" ? `<p>${formulaHtml}</p><p><br /></p>` : `${formulaHtml}&nbsp;`;
          if (!this.insertHtmlAtFormulaAnchor(html)) {
            this.restoreDialogSelection();
            this.insertHtml(html);
          }
        }

        this.closeDialog("formula");
        this.showTip(this.t("tips.formulaInserted"));
      } catch {
        this.showTip(this.t("tips.formulaFailed"), true);
      }
    }

    if (name === "color-picker") {
      this.applyCustomColor(this.currentColorDialogTarget, this.colorDialogHex.value);
      this.closeDialog("color-picker");
      return;
    }

    if (name === "ai-chat-send") {
      await this.sendAiChat();
      return;
    }
  }

  // 处理本地图片选择完成后的上传/插入流程。
  async handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const showUploadTip = this.options.image?.isShowTip !== false;
    if (showUploadTip) {
      this.showUploadMask(files.length > 1 ? this.tf("tips.imageUploadingCount", { count: files.length }) : this.t("tips.imageUploading"));
    }
    try {
      await this.uploadFiles(files);
    } catch {
      this.showTip(this.t("tips.imageUploadFailed"), true);
    } finally {
      event.target.value = "";
      if (showUploadTip) {
        this.hideUploadMask();
      }
    }
  }

  // 处理 Word 文件导入。
  async handleWordImportChange(event) {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }

    this.showUploadMask(this.t("tips.wordImporting"));
    try {
      const result = await importWordFile(file);
      this.setHtml(polishHtml(result.html), true);
      this.showTip(this.t("tips.wordImportSuccess"));
    } catch (error) {
      this.showTip(error?.message || this.t("tips.wordImportFailed"), true);
    } finally {
      event.target.value = "";
      this.hideUploadMask();
    }
  }

  // 全局按键监听：当前主要用于 Esc 退出全屏。
  handleWindowKeydown(event) {
    if (event.key === "Escape" && this.isFullscreen && document.fullscreenElement !== this.root) {
      this.toggleFullscreen();
    }
  }

  // 浏览器全屏状态变化时，统一同步编辑器内部状态。
  handleFullscreenChange() {
    const active = document.fullscreenElement === this.root;
    this.isFullscreen = active;
    this.root.classList.toggle("is-fullscreen", active);
    document.body.classList.toggle("javaex-editor-body-fullscreen", active);
    if (active) {
      this.closeSplitPreview();
    }
    if (!active && this.pendingPreviewDialogOpen) {
      this.pendingPreviewDialogOpen = false;
      this.showPreviewDialog();
    }
    this.updateActiveStates();
    this.repositionActiveMenu();
  }

  // 上传图片并把返回结果批量转换成 HTML 插入编辑区。
  async uploadFiles(files) {
    let items = [];
    if (typeof this.options.imageUploader === "function") {
      items = normalizeUploadResult(await this.options.imageUploader(files, this.createContext()), files);
    } else {
      items = normalizeUploadResult(await Promise.all(files.map(async (file) => ({ url: await readFileAsDataUrl(file), alt: file.name }))), files);
    }

    if (!items.length) {
      return;
    }

    const html = items.map((item) => {
      const extraAttrs = Object.entries(item.attrs || {}).map(([key, value]) => `${key}="${escapeAttribute(value)}"`).join(" ");
      const attrs = extraAttrs ? ` ${extraAttrs}` : "";
      return `<figure class="javaex-editor-edit-image"><img src="${escapeAttribute(item.url)}" alt="${escapeAttribute(item.alt || "")}" title="${escapeAttribute(item.title || "")}"${attrs} /></figure>`;
    }).join("<p><br /></p>");

    this.insertHtml(html);
    this.showTip(this.tf("tips.imageInsertedCount", { count: items.length }));
  }

  // 行内样式（字体、字号、颜色等）在“选区折叠”的情况下，需要插入零宽字符载体，
  // 这样用户继续输入时，新文字仍会落在该样式节点内部。
  // 对当前选区应用行内样式。
  // 选区折叠时会插入零宽字符载体，确保后续输入仍继承这些样式。
  applyInlineStyle(styleMap, options = {}) {
    const { preserveSelection = false } = options;
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }

    const span = document.createElement("span");
    Object.entries(styleMap).forEach(([key, value]) => {
      span.style.setProperty(key, value);
    });

    if (range.collapsed) {
      const textNode = document.createTextNode("\u200b");
      span.appendChild(textNode);
      range.insertNode(span);
      const nextRange = document.createRange();
      nextRange.setStart(textNode, 1);
      nextRange.collapse(true);
      setSelectionRange(nextRange);
      this.savedRange = nextRange.cloneRange();
    } else {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      if (!preserveSelection) {
        nextRange.collapse(false);
      }
      setSelectionRange(nextRange);
      this.savedRange = nextRange.cloneRange();
    }

    this.afterMutation();
  }

  // 清除当前选区上的指定行内样式。
  // 折叠选区时会把光标移出当前样式环境，而不是直接删除已有内容。
  clearInlineStyle(propertyNames, options = {}) {
    const { preserveSelection = false } = options;
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }

    if (range.collapsed) {
      const carrier = this.findClosestStyledAncestor(range.startContainer, propertyNames);
      const marker = document.createTextNode("\u200b");

      if (carrier?.parentNode) {
        carrier.parentNode.insertBefore(marker, carrier.nextSibling);
      } else {
        range.insertNode(marker);
      }

      const nextRange = document.createRange();
      nextRange.setStart(marker, 1);
      nextRange.collapse(true);
      setSelectionRange(nextRange);
      this.savedRange = nextRange.cloneRange();
      this.afterMutation();
      return;
    }

    const span = document.createElement("span");
    propertyNames.forEach((property) => {
      span.style.setProperty(property, property === "background-color" ? "transparent" : "inherit");
    });

    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    if (!preserveSelection) {
      nextRange.collapse(false);
    }
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
    this.afterMutation();
  }

  // 应用块级标签格式，例如 P、H1-H6。
  // 有选区时依赖浏览器 formatBlock；仅光标时则替换当前块元素。
  applyFormat(tagName) {
    // 段落格式作用于块级元素；如果当前只有光标，则替换光标所在块的标签。
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }

    if (!range.collapsed) {
      document.execCommand("formatBlock", false, tagName === "P" ? "P" : `<${tagName}>`);
      this.afterMutation();
      return;
    }

    const currentBlock = this.findClosestBlock(range.startContainer);
    if (currentBlock && this.editor.contains(currentBlock) && this.isBlockElement(currentBlock)) {
      const offset = this.getTextOffsetWithin(currentBlock, range.startContainer, range.startOffset);
      const replacement = document.createElement(tagName.toLowerCase());
      replacement.innerHTML = currentBlock.innerHTML || "<br />";
      currentBlock.replaceWith(replacement);
      this.placeCaretByTextOffset(replacement, offset);
      this.afterMutation();
      return;
    }

    this.insertHtml(`<${tagName.toLowerCase()}><br /></${tagName.toLowerCase()}>`);
  }

  // 通过修改块级元素的 margin-left 来增减缩进。
  adjustIndent(delta) {
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }

    const block = this.findClosestBlock(range.startContainer);
    if (!block || !this.editor.contains(block)) {
      return;
    }

    const current = parseInt(block.style.marginLeft || "0", 10) || 0;
    const next = Math.max(0, current + delta);
    block.style.marginLeft = next ? `${next}px` : "";
    this.afterMutation();
  }

  // 根据用户在表格面板中选择的行列数插入一个基础表格。
  insertTable(rows, cols) {
    const body = Array.from({ length: rows }, () => `<tr>${Array.from({ length: cols }, () => "<td><br /></td>").join("")}</tr>`).join("");
    this.insertHtml(`<table class="javaex-editor-edit-table"><tbody>${body}</tbody></table><p><br /></p>`);
    this.closeMenus();
  }

  // 表格右键菜单动作分发器。
  // 这里统一承接插入/删除行列、标题样式切换、剪贴板操作等逻辑。
  handleTableAction(action) {
    if (action === "copy" || action === "cut" || action === "paste") {
      this.handleTableClipboardAction(action);
      return;
    }

    if (["row-header", "col-header", "row-header-bold", "col-header-bold"].includes(action)) {
      this.toggleTableHeader(action);
      return;
    }

    const parts = this.getTableParts();
    if (!parts) {
      return;
    }

    if (action === "row-above" || action === "row-below") {
      const newRow = parts.row.cloneNode(true);
      Array.from(newRow.cells).forEach((cell) => {
        cell.innerHTML = "<br />";
      });
      if (action === "row-above") {
        parts.row.before(newRow);
      } else {
        parts.row.after(newRow);
      }
      this.activeTableCell = newRow.cells[Math.min(parts.columnIndex, newRow.cells.length - 1)];
    }

    if (action === "row-remove") {
      const rows = Array.from(parts.table.rows);
      if (rows.length <= 1) {
        parts.table.remove();
        this.activeTableCell = null;
      } else {
        const nextRow = rows[parts.rowIndex + 1] || rows[parts.rowIndex - 1];
        parts.row.remove();
        this.activeTableCell = nextRow?.cells[Math.min(parts.columnIndex, nextRow.cells.length - 1)] || null;
      }
    }

    if (action === "col-left" || action === "col-right") {
      const insertIndex = action === "col-left" ? parts.columnIndex : parts.columnIndex + 1;
      Array.from(parts.table.rows).forEach((row) => {
        const cell = row.insertCell(insertIndex);
        cell.innerHTML = "<br />";
      });
      this.activeTableCell = parts.table.rows[parts.rowIndex]?.cells[insertIndex] || null;
    }

    if (action === "col-remove") {
      if (parts.table.rows[0]?.cells.length <= 1) {
        parts.table.remove();
        this.activeTableCell = null;
      } else {
        Array.from(parts.table.rows).forEach((row) => row.deleteCell(parts.columnIndex));
        this.activeTableCell = parts.table.rows[parts.rowIndex]?.cells[Math.max(parts.columnIndex - 1, 0)] || null;
      }
    }

    if (parts.table.isConnected) {
      this.syncTableHeaderVisual(parts.table);
    }
    this.hideTableContextMenu();
    this.syncOutput();
    if (this.activeTableCell) {
      this.placeCaretInside(this.activeTableCell);
    }
  }

  // 表格内的复制/剪切/粘贴逻辑。
  // 这里主要针对“单元格内文本选区”做特殊处理，而不是处理整张表格。
  async handleTableClipboardAction(action) {
    if (!this.activeTableCell) {
      return;
    }

    if ((action === "copy" || action === "cut") && !this.hasTableTextSelection()) {
      return;
    }

    if (action === "paste") {
      try {
        if (navigator.clipboard?.readText) {
          const text = await navigator.clipboard.readText();
          this.activeTableCell.innerHTML = escapeHtml(text).replace(/\n/g, "<br />") || "<br />";
          this.placeCaretInside(this.activeTableCell);
          this.hideTableContextMenu();
          this.syncOutput();
          this.showTip(this.t("tips.cellPasted"));
          return;
        }
      } catch {}

      this.showTip(this.t("tips.pasteDenied"), true);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(this.activeTableCell);
    setSelectionRange(range);
    this.savedRange = range.cloneRange();
    document.execCommand(action, false);

    if (action === "cut") {
      this.activeTableCell.innerHTML = "<br />";
      this.placeCaretInside(this.activeTableCell);
      this.syncOutput();
      this.showTip(this.t("tips.cellCut"));
    } else {
      this.showTip(this.t("tips.cellCopied"));
    }

    this.hideTableContextMenu();
  }

  // 切换表格的行标题、列标题以及标题加粗状态。
  toggleTableHeader(action) {
    const parts = this.getTableParts();
    if (!parts) {
      return;
    }

    const state = this.getTableHeaderState(parts.table);
    if (action === "row-header") {
      state.rowHeader = !state.rowHeader;
    }
    if (action === "col-header") {
      state.colHeader = !state.colHeader;
    }
    if (action === "row-header-bold") {
      state.rowHeaderBold = !state.rowHeaderBold;
    }
    if (action === "col-header-bold") {
      state.colHeaderBold = !state.colHeaderBold;
    }

    this.setTableHeaderState(parts.table, state);
    this.syncTableHeaderVisual(parts.table);
    this.updateTableContextState();
    this.syncOutput();
  }

  // 基于当前激活的单元格，解析出表格、行、列以及对应索引信息。
  getTableParts() {
    if (!this.activeTableCell) {
      return null;
    }
    const row = this.activeTableCell.parentElement;
    const table = row?.closest("table");
    if (!row || !table) {
      return null;
    }
    return {
      row,
      table,
      rowIndex: row.sectionRowIndex,
      columnIndex: this.activeTableCell.cellIndex
    };
  }

  // 判断当前是否存在位于表格单元格中的文本选区。
  hasTableTextSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return false;
    }
    const range = selection.getRangeAt(0);
    return !!this.findClosestTag(range.commonAncestorContainer, ["TD", "TH"]);
  }

  // 根据当前是否存在可复制/剪切的文本，刷新表格右键菜单里的禁用态。
  updateTableContextClipboardState() {
    const canCopyOrCut = this.hasTableTextSelection();
    Array.from(this.tableContextMenu.querySelectorAll('[data-value="copy"], [data-value="cut"]')).forEach((button) => {
      button.disabled = !canCopyOrCut;
    });
  }

  // 读取表格节点上记录的标题样式状态。
  getTableHeaderState(table) {
    return {
      rowHeader: table?.dataset.rowHeader === "true",
      colHeader: table?.dataset.colHeader === "true",
      rowHeaderBold: table?.dataset.rowHeaderBold === "true",
      colHeaderBold: table?.dataset.colHeaderBold === "true"
    };
  }

  // 把表格标题状态写回到 table.dataset，方便后续刷新样式和导出。
  setTableHeaderState(table, state) {
    if (!table) {
      return;
    }
    table.dataset.rowHeader = String(Boolean(state.rowHeader));
    table.dataset.colHeader = String(Boolean(state.colHeader));
    table.dataset.rowHeaderBold = String(Boolean(state.rowHeaderBold));
    table.dataset.colHeaderBold = String(Boolean(state.colHeaderBold));
  }

  // 根据 dataset 中保存的状态，把标题相关样式同步到具体单元格上。
  syncTableHeaderVisual(table) {
    if (!table) {
      return;
    }
    const state = this.getTableHeaderState(table);
    Array.from(table.rows).forEach((row, rowIndex) => {
      Array.from(row.cells).forEach((cell, columnIndex) => {
        const isHeaderCell = (state.rowHeader && rowIndex === 0) || (state.colHeader && columnIndex === 0);
        const isBoldCell = (state.rowHeaderBold && rowIndex === 0) || (state.colHeaderBold && columnIndex === 0);
        cell.classList.toggle("javaex-editor-table-head-cell", isHeaderCell);
        cell.classList.toggle("javaex-editor-table-head-bold", isBoldCell);
      });
    });
  }

  // 初始化内容或切换模式后，批量重建所有表格的标题样式表现。
  syncAllTableHeaderVisuals() {
    Array.from(this.editor.querySelectorAll("table")).forEach((table) => {
      table.classList.add("javaex-editor-edit-table");
      this.syncTableHeaderVisual(table);
    });
  }

  // 打开表格右键菜单前，统一刷新菜单里各项开关状态。
  updateTableContextState() {
    this.updateTableContextClipboardState();
    const parts = this.getTableParts();
    const state = this.getTableHeaderState(parts?.table);
    const activeMap = {
      "row-header": state.rowHeader,
      "col-header": state.colHeader,
      "row-header-bold": state.rowHeaderBold,
      "col-header-bold": state.colHeaderBold
    };
    Array.from(this.tableContextMenu.querySelectorAll(".javaex-editor-context-item")).forEach((button) => {
      const value = button.dataset.value;
      button.classList.toggle("is-active", Boolean(activeMap[value]));
    });
  }

  // 根据当前选中的表情分组渲染表情按钮列表。
  renderEmojiTabs() {
    const activeKey = this.emojiGrid?.dataset.emojiGroup || this.options.emojiGroups[0]?.key || defaultEmojiGroups[0].key;
    const tabs = this.host.querySelector('[data-ref="emojiTabs"]');
    if (!tabs) {
      return;
    }
    tabs.innerHTML = this.options.emojiGroups.map((group) => `<button type="button" ${group.key === activeKey ? 'class="active"' : ""} data-emoji-tab="${escapeAttribute(group.key)}">${escapeHtml(group.label)}</button>`).join("");
    this.renderEmojiGrid(activeKey);
  }

  renderEmojiGrid(key) {
    Array.from(this.host.querySelectorAll("[data-emoji-tab]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.emojiTab === key);
    });
    const group = this.options.emojiGroups.find((item) => item.key === key) || this.options.emojiGroups[0];
    this.emojiGrid.dataset.emojiGroup = group?.key || "";
    this.emojiGrid.innerHTML = (group?.items || []).map((item) => {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label || item.value;
      const type = typeof item === "string" ? "text" : item.type || "text";
      if (type === "image") {
        return `<button type="button" class="javaex-editor-emoji javaex-editor-emoji-image" title="${escapeAttribute(label)}" data-emoji-type="image" data-emoji-label="${escapeAttribute(label)}" data-emoji-value="${escapeAttribute(value)}"><img src="${escapeAttribute(value)}" alt="${escapeAttribute(label)}" /></button>`;
      }
      return `<button type="button" class="javaex-editor-emoji" data-emoji-type="text" data-emoji-value="${escapeAttribute(value)}">${escapeHtml(label)}</button>`;
    }).join("");
  }

  // 渲染 AI 面板按钮。
  // 除了内置动作外，也会把扩展动作一并挂进去。
  renderAiActions() {
    const actions = [];
    if (this.options.ai?.enabled !== false) {
      actions.push(
        { key: "polish", label: this.t("aiActions.polish"), description: this.t("aiActions.polishDescription") },
        { key: "chat", label: this.t("aiActions.chat"), description: this.t("aiActions.chatDescription") }
      );
    }
    const extensionActions = this.getExtensionActions();
    this.extensionActionMap = new Map(extensionActions.map((item) => [item.key, item]));
    extensionActions.forEach((item) => {
      actions.push({
        key: item.key,
        label: item.label,
        description: item.description || item.title || this.t("aiActions.extensionDescription")
      });
    });
    this.aiActions.innerHTML = actions.map((item) => `<button type="button" class="javaex-editor-action" data-menu-action="ai" data-value="${item.key}"><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.description)}</small></button>`).join("");
  }

  // 过滤出允许出现在 AI 面板中的扩展动作。
  getExtensionActions() {
    return [...(this.options.extensions || [])].filter((item) => {
      if (!item || !item.key || typeof item.action !== "function") {
        return false;
      }
      if ((item.placement || "ai") !== "ai") {
        return false;
      }
      return true;
    });
  }

  // 过滤出允许出现在工具栏中的业务扩展，并整理成 Map 方便渲染和点击时快速查找。
  createToolbarExtensionMap() {
    const actions = [...(this.options.extensions || [])].filter((item) => {
      if (!item || !item.key || typeof item.action !== "function") {
        return false;
      }
      return item.placement === "toolbar";
    });
    return new Map(actions.map((item) => [item.key, item]));
  }

  // 执行业务注册到工具栏上的扩展动作。
  // 默认不允许在 Markdown 模式下执行，除非扩展显式声明 allowMarkdown，避免插入 HTML 类动作误写到 Markdown 文本里。
  async runToolbarExtension(key) {
    const extensionAction = this.toolbarExtensionMap.get(key);
    if (!extensionAction) {
      return;
    }
    if (this.currentEditMode === "markdown" && extensionAction.allowMarkdown !== true) {
      this.showTip(this.t("tips.markdownOnly"), true);
      return;
    }

    this.closeMenus();
    try {
      await extensionAction.action(this.createContext());
    } catch (error) {
      console.error(error);
      this.showTip(this.t("tips.extensionFailed"), true);
    }
  }

  // 执行 AI 面板动作。
  // 既支持系统内置动作，也支持外部扩展注册的自定义动作。
  async runAiAction(action) {
    const extensionAction = this.extensionActionMap.get(action);
    if (extensionAction) {
      try {
        await extensionAction.action(this.createContext());
      } catch {
        this.showTip(this.t("tips.extensionFailed"), true);
      }
      return;
    }

    const payload = {
      html: this.getHtml(),
      text: this.getText(),
      markdown: this.getMarkdown()
    };

    try {
      if (action === "polish") {
        const result = typeof this.options.ai?.polish === "function"
          ? await this.options.ai.polish(payload, this.createContext())
          : await this.requestAiContent("polish", payload);
        if (typeof result === "string") {
          this.setHtml(result);
        } else if (result?.html) {
          this.setHtml(result.html);
        }
      }
    } catch {
      this.showTip(this.t("tips.aiFailed"), true);
    }
  }

  getAiPrompts() {
    const ai = this.options.ai || {};
    return {
      polishSystem: this.t("aiPrompts.polishSystem", DEFAULT_AI_PROMPTS.polishSystem),
      polishUser: this.t("aiPrompts.polishUser", DEFAULT_AI_PROMPTS.polishUser),
      chatSystem: this.t("aiPrompts.chatSystem", DEFAULT_AI_PROMPTS.chatSystem),
      chatUser: this.t("aiPrompts.chatUser", DEFAULT_AI_PROMPTS.chatUser),
      ...(ai.prompts || {}),
      ...(ai.polishSystemPrompt ? { polishSystem: ai.polishSystemPrompt } : {}),
      ...(ai.polishUserPrompt ? { polishUser: ai.polishUserPrompt } : {}),
      ...(ai.chatSystemPrompt ? { chatSystem: ai.chatSystemPrompt } : {}),
      ...(ai.chatUserPrompt ? { chatUser: ai.chatUserPrompt } : {})
    };
  }

  buildAiMessages(type, payload = {}) {
    const prompts = this.getAiPrompts();
    if (type === "polish") {
      return [
        { role: "system", content: renderTemplate(prompts.polishSystem, payload) },
        { role: "user", content: renderTemplate(prompts.polishUser, payload) }
      ];
    }

    const hasSelection = Boolean((payload.selectionHtml || "").trim() || (payload.selectionText || "").trim());
    const targetHtml = hasSelection ? (payload.selectionHtml || payload.selectionText) : (payload.html || "");
    const scopeText = hasSelection ? this.t("aiPrompts.scopeSelection") : this.t("aiPrompts.scopeAll");
    const chatPayload = {
      ...payload,
      hasSelection,
      targetHtml,
      scopeText
    };
    return [
      { role: "system", content: renderTemplate(prompts.chatSystem, chatPayload) },
      { role: "user", content: renderTemplate(prompts.chatUser, chatPayload) }
    ];
  }

  async requestAiContent(type, payload = {}) {
    const ai = this.options.ai || {};
    if (typeof ai.request !== "function") {
      if (type === "polish") {
        return { html: polishHtml(payload.html) };
      }
      throw new Error("javaexEditor: ai.request is required");
    }

    const messages = this.buildAiMessages(type, payload);
    // requestPayload 是给业务 AI 接口的完整上下文。
    // messages 是真正要发送给大模型的对话数组；targetHtml/hasSelection 方便业务层做日志、鉴权或二次加工。
    const hasSelection = Boolean((payload.selectionHtml || "").trim() || (payload.selectionText || "").trim());
    const requestPayload = {
      ...payload,
      type,
      messages,
      hasSelection,
      targetHtml: hasSelection ? (payload.selectionHtml || payload.selectionText) : (payload.html || "")
    };
    const response = await ai.request(messages, requestPayload, this.createContext());
    // 不同项目的 AI 接口返回结构不一样，所以编辑器只内置常见字段解析。
    // 如果后端把内容放在更深层，业务方通过 ai.getResult(response) 明确告诉编辑器取哪个值。
    const resolver = ai.getResult || ai.resolveResult || ai.resultResolver;
    const content = typeof resolver === "function" ? resolver(response, requestPayload) : resolveAiResponseContent(response);
    return { html: stripAiCodeFence(content) };
  }

  // 读取当前选区的 HTML 与纯文本内容，供 AI 对话等能力使用。
  getSelectedContentPayload() {
    const range = this.savedRange || getSelectionRange();
    if (!range || !this.editor.contains(range.commonAncestorContainer) || range.collapsed) {
      return {
        text: "",
        html: ""
      };
    }

    const fragment = range.cloneContents();
    const container = document.createElement("div");
    container.appendChild(fragment);
    return {
      text: container.innerText.trim(),
      html: container.innerHTML.trim()
    };
  }

  // 把当前指令和选区内容交给外部 ai.chat 回调处理。
  async sendAiChat() {
    const prompt = this.aiChatPrompt.value.trim();
    if (!prompt) {
      this.showTip(this.t("tips.aiPromptRequired"), true);
      return;
    }

    if (typeof this.options.ai?.chat !== "function" && typeof this.options.ai?.request !== "function") {
      this.showTip(this.t("tips.aiRequestRequired"), true);
      return;
    }

    const selection = this.getSelectedContentPayload();
    const payload = {
      prompt,
      selectionHtml: selection.html,
      selectionText: selection.text,
      html: this.getHtml(),
      text: this.getText(),
      markdown: this.getMarkdown()
    };

    this.showUploadMask(this.t("tips.aiGenerating"));
    try {
      const result = typeof this.options.ai?.chat === "function"
        ? await this.options.ai.chat(payload, this.createContext())
        : await this.requestAiContent("chat", payload);
      let nextHtml = "";
      if (typeof result === "string") {
        nextHtml = result;
      } else if (result?.html) {
        nextHtml = result.html;
      } else if (result?.text) {
        nextHtml = escapeHtml(result.text).replace(/\n/g, "<br />");
      }

      if (nextHtml) {
        this.aiChatResult = nextHtml;
        this.applyAiChatResult();
      } else {
        this.closeDialog("ai-chat");
        this.showTip(this.t("tips.aiDone"));
      }
    } catch {
      this.showTip(this.t("tips.aiChatFailed"), true);
    } finally {
      this.hideUploadMask();
    }
  }

  // 应用 AI 对话结果。
  // 如果之前记录了选区，则只替换选区；否则直接整篇覆盖。
  applyAiChatResult() {
    if (!this.aiChatResult) {
      this.showTip(this.t("tips.aiResultRequired"), true);
      return;
    }

    if (this.aiChatRange) {
      this.savedRange = this.aiChatRange.cloneRange();
      this.focus();
      this.restoreSelection();
      const range = getSelectionRange();
      if (range && this.editor.contains(range.commonAncestorContainer)) {
        range.deleteContents();
      }
    } else {
      this.setHtml(this.aiChatResult);
      this.closeDialog("ai-chat");
      this.showTip(this.t("tips.aiApplied"));
      return;
    }

    this.insertHtml(this.aiChatResult);
    this.closeDialog("ai-chat");
    this.showTip(this.t("tips.aiApplied"));
  }

  // 切换编辑器全屏态。
  async toggleFullscreen() {
    if (typeof this.root.requestFullscreen !== "function" || typeof document.exitFullscreen !== "function") {
      this.isFullscreen = !this.isFullscreen;
      this.root.classList.toggle("is-fullscreen", this.isFullscreen);
      document.body.classList.toggle("javaex-editor-body-fullscreen", this.isFullscreen);
      this.updateActiveStates();
      return;
    }

    try {
      if (document.fullscreenElement === this.root) {
        await document.exitFullscreen();
        return;
      }
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      await this.root.requestFullscreen();
    } catch {
      this.isFullscreen = !this.isFullscreen;
      this.root.classList.toggle("is-fullscreen", this.isFullscreen);
      document.body.classList.toggle("javaex-editor-body-fullscreen", this.isFullscreen);
      this.updateActiveStates();
    }
  }

  // 打开预览。
  // 预览模式分为弹窗和分栏两种，这里根据配置决定具体行为。
  openPreview(tab = "preview") {
    this.refreshPreview();
    if (document.fullscreenElement === this.root && typeof document.exitFullscreen === "function") {
      this.pendingPreviewDialogOpen = true;
      document.exitFullscreen().catch(() => {
        this.pendingPreviewDialogOpen = false;
        this.showPreviewDialog();
      });
      return;
    }
    if (this.isFullscreen) {
      this.showPreviewDialog();
      return;
    }
    if (this.options.previewMode === "split") {
      this.root.classList.add("has-split-preview");
      this.splitPreviewPane.classList.add("is-active");
    } else {
      this.showPreviewDialog();
    }
  }

  // 关闭分栏预览。
  closeSplitPreview() {
    this.root.classList.remove("has-split-preview");
    this.splitPreviewPane.classList.remove("is-active");
  }

  // 切换预览区域内部的页签。
  setPreviewTab(tab, scope) {
    if (!scope) {
      return;
    }

    Array.from(scope.querySelectorAll("[data-preview-tab]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.previewTab === tab);
    });

    const isPreview = tab === "preview";
    if (scope === this.splitPreviewPane) {
      this.splitPreviewHtml.hidden = !isPreview;
    } else {
      this.dialogPreviewHtml.hidden = !isPreview;
    }
  }

  // 用最新 HTML 刷新弹窗预览和分栏预览内容。
  refreshPreview() {
    const html = sanitizeHtml(this.getHtml());
    this.dialogPreviewHtml.innerHTML = html;
    this.splitPreviewHtml.innerHTML = html;
    this.decoratePreviewCodeBlocks(this.dialogPreviewHtml);
    this.decoratePreviewCodeBlocks(this.splitPreviewHtml);
  }

  showPreviewDialog() {
    this.dialogs.get("preview")?.classList.add("is-open");
  }

  normalizePreviewCodeText(node) {
    if (!node) {
      return "";
    }
    const clone = node.cloneNode(true);
    Array.from(clone.querySelectorAll("br")).forEach((br) => {
      br.replaceWith("\n");
    });
    Array.from(clone.querySelectorAll("div, p, li, tr")).forEach((block) => {
      if (!block.nextSibling || block.nextSibling.textContent !== "\n") {
        block.after("\n");
      }
    });
    Array.from(clone.querySelectorAll("[style]")).forEach((element) => {
      if (/display\s*:\s*block/i.test(element.getAttribute("style") || "") && (!element.nextSibling || element.nextSibling.textContent !== "\n")) {
        element.after("\n");
      }
    });
    return String(clone.innerText || clone.textContent || "")
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ")
      .trimEnd();
  }

  renderPreviewCodeLines(text) {
    const lines = String(text || "").split("\n");
    return `<table class="hljs-ln"><tbody>${lines.map((line, index) => `<tr><td class="hljs-ln-line hljs-ln-numbers" data-line-number="${index + 1}">${index + 1}</td><td class="hljs-ln-line hljs-ln-code">${line ? escapeHtml(line) : "&nbsp;"}</td></tr>`).join("")}</tbody></table>`;
  }

  selectPreviewCodeContent(target) {
    if (!target) {
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

  async copyPreviewCodeText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    document.execCommand?.("copy");
  }

  updatePreviewCopyButton(button, text) {
    if (!button) {
      return;
    }
    button.textContent = text;
    const oldTimer = PREVIEW_COPY_TIMERS.get(button);
    if (oldTimer) {
      clearTimeout(oldTimer);
    }
    if (text === this.t("codeCopy.copied")) {
      const timer = window.setTimeout(() => {
        button.textContent = this.t("codeCopy.copy");
        PREVIEW_COPY_TIMERS.delete(button);
      }, 2000);
      PREVIEW_COPY_TIMERS.set(button, timer);
    }
  }

  ensurePreviewCopyButton(pre, codeText) {
    let button = pre.querySelector(".javaex-editor-codecopy-btn");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "javaex-editor-codecopy-btn";
      pre.appendChild(button);
    }
    button.textContent = this.t("codeCopy.copy");
    button.onclick = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const codeElement = pre.querySelector("code") || pre;
      this.selectPreviewCodeContent(codeElement);
      try {
        await this.copyPreviewCodeText(codeText);
        this.updatePreviewCopyButton(button, this.t("codeCopy.copied"));
      } catch {
        this.updatePreviewCopyButton(button, this.t("codeCopy.copy"));
      }
    };
  }

  decoratePreviewCodeBlocks(container) {
    if (!container) {
      return;
    }
    Array.from(container.querySelectorAll("pre")).forEach((pre) => {
      let code = pre.querySelector("code");
      if (!code) {
        code = document.createElement("code");
        code.innerHTML = pre.innerHTML;
        pre.innerHTML = "";
        pre.appendChild(code);
      }
      const codeText = this.normalizePreviewCodeText(code);
      code.classList.add("hljs");
      code.innerHTML = this.renderPreviewCodeLines(codeText);
      this.ensurePreviewCopyButton(pre, codeText);
    });
  }

  // 保存当前 HTML 编辑区内的选区。
  // 点击工具栏按钮前后都会依赖它来恢复插入点。
  saveSelection() {
    const range = getSelectionRange();
    if (range && this.editor.contains(range.commonAncestorContainer)) {
      this.savedRange = range.cloneRange();
    }
  }

  // 恢复之前保存的选区。
  restoreSelection() {
    if (this.hasEditableRange(this.savedRange)) {
      setSelectionRange(this.savedRange);
    }
  }

  // 判断一个 Range 是否仍然落在当前编辑器内部。
  // 这是很多命令的安全前置校验，避免误操作到别的输入区域。
  hasEditableRange(range) {
    return Boolean(range && this.editor?.contains(range.commonAncestorContainer));
  }

  // 某些浏览器在点击工具栏按钮后会丢失真实选区。
  // 这里会尽量恢复最近一次有效选区；如果编辑区是空段落，则补一个可用光标。
  // 保证当前存在一个可用的 HTML 编辑区选区。
  // 如果浏览器已经丢失真实选区，这里会尝试恢复；空段落场景还会补一个稳定光标。
  ensureEditableSelection() {
    if (this.currentEditMode !== "html") {
      return null;
    }

    this.focus();
    this.restoreSelection();

    let range = getSelectionRange();
    if (this.hasEditableRange(range)) {
      return range;
    }

    this.normalizeEditorEmptyState();
    const fallback = this.editor.lastElementChild || this.editor.firstElementChild || this.editor;

    if (this.isBlankParagraphLike(fallback)) {
      this.placeCaretInEmptyParagraph(fallback);
      return this.savedRange;
    }

    const nextRange = document.createRange();
    nextRange.selectNodeContents(fallback);
    nextRange.collapse(false);
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
    range = getSelectionRange();
    return this.hasEditableRange(range) ? range : null;
  }

  // 根据格式 key 读取对应的标签集合、命令名和元素名配置。
  getInlineFormatConfig(key) {
    const tags = INLINE_FORMAT_TAGS[key];
    const element = INLINE_FORMAT_ELEMENTS[key];
    const command = ACTIVE_COMMANDS[key];
    if (!tags || !element || !command) {
      return null;
    }
    return { key, tags, element, command };
  }

  // 从当前节点向上查找最近的行内格式祖先节点。
  findClosestInlineFormatNode(node, key) {
    const config = this.getInlineFormatConfig(key);
    return config ? this.findClosestTag(node, config.tags) : null;
  }

  // 由于 queryCommandState 在空段落中的表现并不稳定，所以先看真实 DOM
  // 祖先链，再回退到浏览器原生命令状态。
  // 判断当前光标/选区是否处于某种行内格式状态中。
  // 这里优先看真实 DOM 结构，再回退到浏览器 queryCommandState。
  isInlineFormatActive(key, range = null) {
    const config = this.getInlineFormatConfig(key);
    if (!config) {
      return false;
    }

    const currentRange = range && this.hasEditableRange(range)
      ? range
      : (this.hasEditableRange(getSelectionRange()) ? getSelectionRange() : this.savedRange);

    if (!this.hasEditableRange(currentRange)) {
      return false;
    }

    if (this.findClosestTag(currentRange.startContainer, config.tags)) {
      return true;
    }

    try {
      return Boolean(document.queryCommandState(config.command));
    } catch {
      return false;
    }
  }

  // 在空光标位置插入一个带格式的零宽载体，让后续输入内容继承该格式。
  // 在空光标位置插入一个“待输入格式载体”。
  // 这样即便当前段落没有文字，后续输入内容也会自然继承对应格式。
  insertInlineFormatCarrier(key, range) {
    const config = this.getInlineFormatConfig(key);
    if (!config) {
      return false;
    }

    const element = document.createElement(config.element);
    const textNode = document.createTextNode("\u200b");
    element.setAttribute("data-javaex-inline-carrier", "true");
    element.setAttribute("data-javaex-inline-command", key);
    element.appendChild(textNode);
    range.insertNode(element);

    const nextRange = document.createRange();
    nextRange.setStart(textNode, 1);
    nextRange.collapse(true);
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
    return true;
  }

  // 退出某个行内格式时，如果当前处于临时载体中，则删除载体；
  // 否则把光标移到最近格式节点后面，保证后续输入恢复为普通文本。
  // 退出某个行内格式。
  // 如果当前位于临时载体内，则删除载体；否则把光标移到最近格式节点后方。
  exitInlineFormat(key, range) {
    const carrier = this.findClosestInlineFormatNode(range.startContainer, key);
    if (!carrier) {
      return false;
    }

    const marker = document.createTextNode("\u200b");

    if (carrier.dataset.javaexInlineCarrier === "true") {
      carrier.replaceWith(marker);
    } else {
      carrier.parentNode?.insertBefore(marker, carrier.nextSibling);
    }

    const nextRange = document.createRange();
    nextRange.setStart(marker, 1);
    nextRange.collapse(true);
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
    return true;
  }

  // 加粗、斜体、下划线、删除线在非折叠选区时继续走原生命令；
  // 只有“空选区 + 空段落”时，才改用自定义载体保持待输入格式。
  // 切换加粗、斜体、下划线、删除线等行内格式。
  // 非折叠选区仍交给浏览器原生命令，折叠选区则使用自定义载体逻辑。
  toggleInlineFormat(key) {
    const config = this.getInlineFormatConfig(key);
    const range = this.ensureEditableSelection();
    if (!config || !range) {
      return;
    }

    if (!range.collapsed) {
      document.execCommand(config.command, false, null);
      this.afterMutation();
      return;
    }

    if (this.isInlineFormatActive(key, range)) {
      this.exitInlineFormat(key, range);
    } else {
      this.insertInlineFormatCarrier(key, range);
    }

    this.afterMutation();
  }

  // 把弹窗打开前记录的选区恢复回 savedRange。
  restoreDialogSelection() {
    if (this.dialogSelectionRange) {
      this.savedRange = this.dialogSelectionRange.cloneRange();
    }
  }

  // 在当前光标位置插入数学公式锚点。
  // 弹窗确认后会回到该锚点附近插入公式 HTML。
  saveFormulaAnchor() {
    this.removeFormulaAnchor(false);
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }

    const markerRange = range.cloneRange();
    markerRange.collapse(true);
    const anchor = document.createElement("span");
    anchor.className = "javaex-editor-formula-anchor";
    anchor.setAttribute("data-formula-anchor", "true");
    anchor.textContent = "\u200b";
    markerRange.insertNode(anchor);
    this.formulaAnchor = anchor;

    const nextRange = document.createRange();
    nextRange.setStartAfter(anchor);
    nextRange.collapse(true);
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
  }

  // 按之前保存的公式锚点位置插入 HTML。
  insertHtmlAtFormulaAnchor(html) {
    if (!this.formulaAnchor || !this.formulaAnchor.isConnected) {
      return false;
    }

    const range = document.createRange();
    range.setStartBefore(this.formulaAnchor);
    range.collapse(true);
    setSelectionRange(range);
    this.savedRange = range.cloneRange();
    this.formulaAnchor.remove();
    this.formulaAnchor = null;
    this.insertHtml(html);
    return true;
  }

  // 在当前光标位置插入远程图片锚点。
  saveRemoteImageAnchor() {
    this.removeRemoteImageAnchor(false);
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }

    const markerRange = range.cloneRange();
    markerRange.collapse(true);
    const anchor = document.createElement("span");
    anchor.className = "javaex-editor-remote-image-anchor";
    anchor.setAttribute("data-remote-image-anchor", "true");
    anchor.textContent = "\u200b";
    markerRange.insertNode(anchor);
    this.remoteImageAnchor = anchor;

    const nextRange = document.createRange();
    nextRange.setStartAfter(anchor);
    nextRange.collapse(true);
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
    this.dialogSelectionRange = nextRange.cloneRange();
  }

  // 按之前保存的远程图片锚点位置插入 HTML。
  insertHtmlAtRemoteImageAnchor(html) {
    if (!this.remoteImageAnchor || !this.remoteImageAnchor.isConnected) {
      return false;
    }

    const range = document.createRange();
    range.setStartBefore(this.remoteImageAnchor);
    range.collapse(true);
    setSelectionRange(range);
    this.savedRange = range.cloneRange();
    this.remoteImageAnchor.remove();
    this.remoteImageAnchor = null;
    this.insertHtml(html);
    return true;
  }

  // 删除数学公式临时锚点，并在需要时把光标移回锚点前方。
  removeFormulaAnchor(restoreCaret) {
    if (!this.formulaAnchor || !this.formulaAnchor.isConnected) {
      this.formulaAnchor = null;
      return;
    }

    if (restoreCaret) {
      const range = document.createRange();
      range.setStartBefore(this.formulaAnchor);
      range.collapse(true);
      setSelectionRange(range);
      this.savedRange = range.cloneRange();
    }

    this.formulaAnchor.remove();
    this.formulaAnchor = null;
  }

  // 删除远程图片临时锚点，并在需要时把光标移回锚点前方。
  removeRemoteImageAnchor(restoreCaret) {
    if (!this.remoteImageAnchor || !this.remoteImageAnchor.isConnected) {
      this.remoteImageAnchor = null;
      return;
    }

    if (restoreCaret) {
      const range = document.createRange();
      range.setStartBefore(this.remoteImageAnchor);
      range.collapse(true);
      setSelectionRange(range);
      this.savedRange = range.cloneRange();
    }

    this.remoteImageAnchor.remove();
    this.remoteImageAnchor = null;
  }

  // 根据当前模式聚焦到 HTML 编辑区或 Markdown 文本框。
  focus() {
    if (this.currentEditMode === "markdown") {
      this.markdownEditor.focus();
    } else {
      this.editor.focus();
    }
  }

  // 执行浏览器内建编辑命令。
  // 例如撤销、重做、对齐、列表等仍然直接复用 execCommand。
  exec(command, value = null) {
    const range = this.ensureEditableSelection();
    if (!range) {
      return;
    }
    document.execCommand(command, false, value);
    this.afterMutation();
  }

  // 一次内容修改后的统一收尾逻辑：
  // 保存选区、同步输出、刷新工具栏高亮状态。
  afterMutation() {
    setTimeout(() => {
      this.syncAllTableHeaderVisuals();
      this.saveSelection();
      this.syncOutput();
      this.updateActiveStates();
    }, 0);
  }

  // 在当前光标/选区处插入 HTML。
  // 没有有效选区时会退化为追加到编辑区末尾。
  insertHtml(html) {
    const range = this.ensureEditableSelection();
    if (!range) {
      this.editor.insertAdjacentHTML("beforeend", html);
      this.afterMutation();
      return;
    }
    if (document.queryCommandSupported?.("insertHTML")) {
      document.execCommand("insertHTML", false, html);
    } else {
      const fragment = range.createContextualFragment(html);
      range.deleteContents();
      range.insertNode(fragment);
    }
    this.afterMutation();
  }

  // 把光标放进某个元素内部的起始位置。
  placeCaretInside(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);
    setSelectionRange(range);
    this.savedRange = range.cloneRange();
  }

  // 计算某个节点偏移量在给定根节点内的“文本总偏移”。
  // 替换块级标签后，需要靠它把光标尽量还原到原来的文本位置。
  getTextOffsetWithin(root, node, offset) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let total = 0;
    let current = walker.nextNode();
    while (current) {
      if (current === node) {
        return total + offset;
      }
      total += current.textContent?.length || 0;
      current = walker.nextNode();
    }
    return total;
  }

  // 根据“文本总偏移”重新把光标定位回目标元素内部。
  placeCaretByTextOffset(root, offset) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let total = 0;
    let current = walker.nextNode();
    while (current) {
      const length = current.textContent?.length || 0;
      if (offset <= total + length) {
        const range = document.createRange();
        range.setStart(current, Math.max(0, offset - total));
        range.collapse(true);
        setSelectionRange(range);
        this.savedRange = range.cloneRange();
        return;
      }
      total += length;
      current = walker.nextNode();
    }
    this.placeCaretInside(root);
  }

  // 从当前节点向上查找最近的块级元素。
  findClosestBlock(node) {
    let current = node?.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    while (current && current !== this.editor) {
      if (this.isBlockElement(current)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  findClosestCodeBlock(node) {
    const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    const codeElement = element?.closest?.("pre, code");
    if (!codeElement || !this.editor.contains(codeElement)) {
      return null;
    }
    return codeElement.tagName === "PRE" ? codeElement : (codeElement.closest("pre") || codeElement);
  }

  isRangeInsideCodeBlock(range, codeBlock) {
    return Boolean(
      range &&
      codeBlock &&
      codeBlock.contains(range.startContainer) &&
      codeBlock.contains(range.endContainer)
    );
  }

  getClipboardCodeText(clipboardData) {
    if (!clipboardData) {
      return null;
    }

    const plainText = clipboardData.getData("text/plain");
    if (plainText) {
      return plainText.replace(/\r\n?/g, "\n");
    }

    const html = clipboardData.getData("text/html");
    if (!html || typeof document === "undefined") {
      return null;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = sanitizeHtml(html);
    Array.from(wrapper.querySelectorAll("br")).forEach((br) => {
      br.replaceWith("\n");
    });
    Array.from(wrapper.querySelectorAll("div, p, li, tr")).forEach((block) => {
      if (!block.nextSibling || block.nextSibling.textContent !== "\n") {
        block.after("\n");
      }
    });
    Array.from(wrapper.querySelectorAll("[style]")).forEach((element) => {
      if (/display\s*:\s*block/i.test(element.getAttribute("style") || "") && (!element.nextSibling || element.nextSibling.textContent !== "\n")) {
        element.after("\n");
      }
    });

    return String(wrapper.innerText || wrapper.textContent || "")
      .replace(/\r\n?/g, "\n")
      .replace(/\u00a0/g, " ");
  }

  insertPlainTextInCodeBlock(range, text) {
    const normalizedText = String(text || "").replace(/\r\n?/g, "\n");
    const textNode = document.createTextNode(normalizedText);
    range.deleteContents();
    range.insertNode(textNode);

    const nextRange = document.createRange();
    nextRange.setStartAfter(textNode);
    nextRange.collapse(true);
    setSelectionRange(nextRange);
    this.savedRange = nextRange.cloneRange();
  }

  getSelectionContextNode(range = null) {
    const targetRange = range || getSelectionRange();
    if (!targetRange) {
      return null;
    }
    return targetRange.startContainer?.nodeType === Node.TEXT_NODE
      ? targetRange.startContainer.parentElement
      : targetRange.startContainer;
  }

  getEffectiveBackgroundColor(node) {
    let current = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current !== this.root) {
      const background = normalizeCssColor(window.getComputedStyle(current).backgroundColor);
      if (background) {
        return background;
      }
      current = current.parentElement;
    }
    return "";
  }

  resolveFontLabelFromStyle(style) {
    const family = String(style?.fontFamily || "")
      .split(",")[0]
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (!family) {
      return FONT_OPTIONS[0].label;
    }
    const matched = FONT_OPTIONS.find((item) => item.value.toLowerCase() === family.toLowerCase());
    return matched?.label || FONT_OPTIONS[0].label;
  }

  resolveFontSizeLabelFromStyle(style) {
    const size = Math.round(Number.parseFloat(style?.fontSize || "0"));
    if (!size) {
      return SIZE_OPTIONS[0].label;
    }
    const matched = SIZE_OPTIONS.find((item) => Number.parseInt(item.px, 10) === size);
    return matched?.label || String(size);
  }

  syncToolbarSelectionState(range = null) {
    if (this.currentEditMode !== "html") {
      return;
    }
    const activeRange = range || getSelectionRange();
    if (!activeRange || !this.editor.contains(activeRange.commonAncestorContainer)) {
      return;
    }

    const contextNode = this.getSelectionContextNode(activeRange);
    if (!contextNode) {
      return;
    }

    const block = this.findClosestBlock(contextNode);
    const formatLabel = block && /^H[1-6]$/.test(block.tagName) ? block.tagName : "p";
    const styleTarget = contextNode.nodeType === Node.ELEMENT_NODE ? contextNode : block || this.editor;
    const selectionStyle = window.getComputedStyle(styleTarget);
    const defaultStyle = window.getComputedStyle(this.editor);
    const textColor = normalizeCssColor(selectionStyle.color);
    const defaultTextColor = normalizeCssColor(defaultStyle.color);
    const backgroundColor = this.getEffectiveBackgroundColor(styleTarget);
    const defaultBackgroundColor = normalizeCssColor(defaultStyle.backgroundColor);

    this.setLabel("format", formatLabel);
    this.setLabel("font", this.resolveFontLabelFromStyle(selectionStyle));
    this.setLabel("size", this.resolveFontSizeLabelFromStyle(selectionStyle));
    this.selectedForeColor = textColor && textColor !== defaultTextColor ? textColor : "";
    this.selectedBackColor = backgroundColor && backgroundColor !== defaultBackgroundColor ? backgroundColor : "";
    this.updateColorIndicators();
  }

  // 判断一个节点是否属于编辑器里认为的块级元素。
  isBlockElement(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }
    return ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "PRE", "LI", "TD", "TH"].includes(node.tagName);
  }

  // 沿祖先链向上查找指定标签，常用于判断当前光标属于哪一类结构。
  findClosestTag(node, tags) {
    // 沿祖先链向上查找指定标签，常用于判断当前光标属于哪一类结构。
    let current = node?.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    while (current && current !== this.editor) {
      if (current.nodeType === Node.ELEMENT_NODE && tags.includes(current.tagName)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  // 全选当前模式下的全部内容。
  selectAll() {
    if (this.currentEditMode === "markdown") {
      this.markdownEditor.focus();
      this.markdownEditor.select();
    } else {
      this.focus();
      const range = document.createRange();
      range.selectNodeContents(this.editor);
      setSelectionRange(range);
      this.savedRange = range.cloneRange();
    }
  }

  // 更新工具栏下拉按钮上显示的当前值。
  setLabel(key, value) {
    const label = this.host.querySelector(`[data-label="${key}"]`);
    if (label) {
      label.textContent = value;
    }
  }

  // 同步编辑模式按钮高亮，以及 HTML/Markdown 两个编辑区域的显隐状态。
  updateEditModeButtons() {
    if (!this.root) {
      return;
    }

    this.root.classList.toggle("is-markdown-mode", this.currentEditMode === "markdown");
    Array.from(this.host.querySelectorAll("[data-edit-mode]")).forEach((button) => {
      button.classList.toggle("active", button.dataset.editMode === this.currentEditMode);
    });

    if (this.editor && this.markdownEditor) {
      this.editor.hidden = this.currentEditMode !== "html";
      this.markdownEditor.hidden = this.currentEditMode !== "markdown";
      this.editor.style.display = this.currentEditMode === "html" ? "block" : "none";
      this.markdownEditor.style.display = this.currentEditMode === "markdown" ? "block" : "none";
    }
  }

  // 在 HTML 与 Markdown 模式之间切换。
  // 这里会根据需要做双向内容转换，并处理预览与工具栏状态同步。
  setEditMode(mode, shouldSync = true, shouldEmit = true) {
    const nextMode = mode === "markdown" ? "markdown" : "html";

    if (nextMode === this.currentEditMode) {
      if (nextMode === "markdown" && shouldSync) {
        this.markdownEditor.value = htmlToMarkdown(normalizeHtml(this.editor.innerHTML || ""));
      }
      if (nextMode === "html" && shouldSync) {
        this.editor.innerHTML = normalizeHtml(markdownToHtml(this.markdownEditor.value)) || "<p><br /></p>";
        this.syncAllTableHeaderVisuals();
        this.ensureTrailingEditableParagraph();
        this.refreshEmptyState();
      }
      this.updateEditModeButtons();
      this.refreshPreview();
      if (shouldEmit) {
        this.syncOutput();
      }
      return;
    }

    if (nextMode === "markdown") {
      if (shouldSync) {
        this.markdownEditor.value = htmlToMarkdown(normalizeHtml(this.editor.innerHTML || ""));
      }
      this.currentEditMode = "markdown";
    } else {
      if (shouldSync) {
        this.editor.innerHTML = normalizeHtml(markdownToHtml(this.markdownEditor.value)) || "<p><br /></p>";
        this.syncAllTableHeaderVisuals();
      }
      this.currentEditMode = "html";
      this.ensureTrailingEditableParagraph({ placeCaret: true });
      this.refreshEmptyState();
    }

    this.closeMenus();
    this.hideTableContextMenu();
    this.updateEditModeButtons();
    this.refreshPreview();

    if (shouldEmit) {
      this.syncOutput();
    }
  }

  // 获取当前编辑模式。
  getEditMode() {
    return this.currentEditMode;
  }

  // 用当前字体色/背景色刷新工具栏图标颜色。
  updateColorIndicators() {
    const foreIcon = this.host.querySelector('[data-tool="foreColor"] .icon');
    const backIcon = this.host.querySelector('[data-tool="backColor"] .icon');

    if (foreIcon) {
      foreIcon.style.color = this.selectedForeColor || "";
    }

    if (backIcon) {
      backIcon.style.color = this.selectedBackColor || "";
    }
  }

  // 刷新工具栏按钮高亮状态。
  // 例如加粗、列表、对齐、全屏等按钮都依赖这里更新视觉状态。
  updateActiveStates() {
    Object.entries(ACTIVE_COMMANDS).forEach(([key, command]) => {
      const button = this.host.querySelector(`[data-tool="${key}"]`);
      if (INLINE_FORMAT_TAGS[key]) {
        button?.classList.toggle("is-active", this.isInlineFormatActive(key));
        return;
      }
      try {
        button?.classList.toggle("is-active", Boolean(document.queryCommandState(command)));
      } catch {
        button?.classList.remove("is-active");
      }
    });
    const fullscreenButton = this.host.querySelector('[data-tool="fullscreen"]');
    fullscreenButton?.classList.toggle("is-active", this.isFullscreen);
    fullscreenButton?.setAttribute("tooltip", this.isFullscreen ? this.t("toolbar.exitFullscreen") : this.t("toolbar.fullscreen"));
    this.updateColorIndicators();
  }

  // 显示上传/导入过程中的遮罩提示。
  showUploadMask(text) {
    this.uploadText.textContent = text;
    this.uploadMask.classList.add("is-open");
  }

  // 隐藏上传遮罩，并恢复默认提示文案。
  hideUploadMask() {
    this.uploadMask.classList.remove("is-open");
    this.uploadText.textContent = this.t("tips.imageUploading");
  }

  // 关闭表格右键菜单。
  hideTableContextMenu() {
    this.tableContextMenu.classList.remove("is-open");
  }

  // 显示一个短暂的轻提示。
  // 默认 2 秒后自动消失，也支持错误态样式。
  showTip(message, isError = false) {
    if (this.tipTimer) {
      clearTimeout(this.tipTimer);
    }
    this.tip.textContent = message;
    this.tip.className = `javaex-editor-tip is-open${isError ? " error" : ""}`;
    this.tipTimer = setTimeout(() => {
      this.tip.className = "javaex-editor-tip";
      this.tipTimer = null;
    }, 2000);
  }

  // 把当前 HTML 保存到本地草稿。
  saveDraft() {
    try {
      localStorage.setItem(getDraftKey(this.options.editorId), this.getHtml());
    } catch {}
  }

  // 检查本地是否存在与当前内容不同的草稿，如果有则显示恢复提示。
  checkDraftNotice() {
    try {
      const localContent = localStorage.getItem(getDraftKey(this.options.editorId));
      this.draftTip.classList.toggle("is-open", Boolean(localContent && localContent !== this.getHtml()));
    } catch {
      this.draftTip.classList.remove("is-open");
    }
  }

  // 恢复本地草稿内容。
  recoverDraft() {
    try {
      const localContent = localStorage.getItem(getDraftKey(this.options.editorId));
      if (localContent) {
        this.setHtml(localContent);
        this.draftTip.classList.remove("is-open");
        this.showTip(this.t("tips.draftRecovered"));
      }
    } catch {}
  }

  // 关闭草稿提示条，但不删除本地草稿。
  cancelDraftNotice() {
    this.draftTip.classList.remove("is-open");
  }

  // 删除当前实例对应的本地草稿。
  deleteTextEditorDraft() {
    deleteTextEditorDraft(this.options.editorId);
    this.draftTip.classList.remove("is-open");
  }

  // 设置编辑区最小高度。
  setMinHeight(height) {
    const value = typeof height === "number" ? `${height}px` : height;
    this.editor.style.minHeight = value;
    this.markdownEditor.style.minHeight = value;
  }

  // 设置编辑区最大高度，超出部分由编辑区自身滚动承接。
  setMaxHeight(height) {
    const value = typeof height === "number" ? `${height}px` : height;
    this.editor.style.maxHeight = value || "";
    this.markdownEditor.style.maxHeight = value || "";
  }

  // 配置工具栏吸顶行为。
  // 传入 top 偏移量时启用吸顶，否则移除吸顶状态。
  setToolbarStickyTop(offset) {
    if (!this.toolbar || !this.root) {
      return;
    }

    const enabled = offset !== null && offset !== undefined && offset !== false && offset !== "";
    this.toolbar.classList.toggle("is-sticky", enabled);
    if (!enabled) {
      this.root.style.removeProperty("--javaex-editor-toolbar-sticky-top");
      return;
    }

    const value = typeof offset === "number" ? `${offset}px` : String(offset);
    this.root.style.setProperty("--javaex-editor-toolbar-sticky-top", value);
  }

  // 启用/禁用整个编辑器。
  // 包括 HTML 编辑区、Markdown 输入框以及所有按钮。
  setDisabled(disabled) {
    this.options.disabled = Boolean(disabled);
    this.root.classList.toggle("is-disabled", this.options.disabled);
    this.editor.contentEditable = String(!this.options.disabled);
    this.markdownEditor.disabled = this.options.disabled;
    Array.from(this.host.querySelectorAll("button")).forEach((button) => {
      if (!button.dataset.draftAction) {
        button.disabled = this.options.disabled;
      }
    });
  }

  // 直接设置整篇 HTML 内容。
  // 这里会同步 Markdown、预览、表格标题样式以及对外回调。
  setHtml(html, shouldEmit = true) {
    const normalized = normalizeHtml(html) || "<p><br /></p>";
    this.editor.innerHTML = normalized;
    this.syncAllTableHeaderVisuals();
    this.ensureTrailingEditableParagraph();
    this.markdownEditor.value = htmlToMarkdown(normalized);
    this.refreshEmptyState();
    this.refreshPreview();
    if (shouldEmit) {
      this.syncOutput();
    }
  }

  // 获取当前 HTML 内容。
  // HTML 模式直接读取编辑区，Markdown 模式则先做一次 Markdown 转 HTML。
  getHtml() {
    if (this.currentEditMode === "markdown") {
      return normalizeHtml(markdownToHtml(this.markdownEditor.value));
    }
    return normalizeHtml(this.getEditorHtmlForOutput());
  }

  // 获取当前纯文本内容。
  getText() {
    return htmlToText(this.getHtml());
  }

  // 获取当前 Markdown 内容。
  // 如果当前是 HTML 模式，会先把 HTML 转成 Markdown。
  getMarkdown() {
    if (this.currentEditMode === "markdown") {
      return String(this.markdownEditor.value || "").replace(/\r\n?/g, "\n");
    }
    return htmlToMarkdown(this.getHtml());
  }

  // 刷新“编辑区是否为空”的视觉状态，用于占位提示显示控制。
  refreshEmptyState() {
    const html = this.getHtml();
    const text = htmlToText(html);
    this.editor.classList.toggle("is-empty", !text && !/<(img|table|video|iframe|blockquote|pre)\b/i.test(html));
  }

  // 输出给回调、预览、外部 API 之前，要把仅用于保持输入状态的临时载体去掉。
  // 对外输出 HTML 前，清理掉仅用于保持输入状态的临时格式载体。
  getEditorHtmlForOutput() {
    const clone = this.editor.cloneNode(true);
    Array.from(clone.querySelectorAll("[data-javaex-inline-carrier]")).forEach((node) => {
      node.removeAttribute("data-javaex-inline-carrier");
      node.removeAttribute("data-javaex-inline-command");
      node.textContent = node.textContent?.replace(/\u200b/g, "") || "";
      if (!node.textContent && !node.children.length) {
        node.remove();
      }
    });

    const trailingPlaceholder = clone.lastElementChild;
    const trailingPlaceholderPrev = trailingPlaceholder?.previousElementSibling;
    if (this.isBlankParagraphLike(trailingPlaceholder) && this.needsTrailingEditableParagraph(trailingPlaceholderPrev)) {
      trailingPlaceholder.remove();
    }

    const html = clone.innerHTML || "";
    if (/^\s*<(p|div)>\s*<\/\1>\s*$/i.test(html)) {
      return "<p><br /></p>";
    }
    return html;
  }

  // 判断某个节点是否可以视为“空段落”。
  // 这类节点会在空内容标准化时被整理成 <p><br /></p>。
  isBlankParagraphLike(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    if (!["P", "DIV"].includes(node.tagName)) {
      return false;
    }

    const html = sanitizeHtml(node.innerHTML || "");
    const text = htmlToText(html);
    return !text && !/<(img|table|video|iframe|blockquote|pre|hr|ul|ol)\b/i.test(html);
  }

  // 判断当前末尾块后面是否需要补一个空段落来承接光标。
  needsTrailingEditableParagraph(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    if (["TABLE", "PRE", "BLOCKQUOTE", "HR"].includes(node.tagName)) {
      return true;
    }

    if (node.matches?.(".javaex-editor-edit-image, .javaex-editor-edit-video, .javaex-editor-edit-embed")) {
      return true;
    }

    return Boolean(node.querySelector?.("img, video, iframe, embed"));
  }

  // 对于表格、媒体、代码块等尾部结构，补一个仅供编辑态使用的空段落。
  ensureTrailingEditableParagraph(options = {}) {
    const { placeCaret = false } = options;

    if (this.currentEditMode !== "html" || !this.editor) {
      return null;
    }

    const last = this.editor.lastElementChild;
    if (!last) {
      this.editor.innerHTML = "<p><br /></p>";
      const paragraph = this.editor.querySelector("p");
      if (placeCaret) {
        this.placeCaretInEmptyParagraph(paragraph);
      }
      return paragraph;
    }

    if (this.isBlankParagraphLike(last)) {
      if (placeCaret) {
        this.placeCaretInEmptyParagraph(last);
      }
      return last;
    }

    if (!this.needsTrailingEditableParagraph(last)) {
      return null;
    }

    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br />";
    this.editor.appendChild(paragraph);

    if (placeCaret) {
      this.placeCaretInEmptyParagraph(paragraph);
    }

    return paragraph;
  }

  // 把光标稳定地放入一个空段落中。
  // 对于 <p><br /></p>，必须把光标放到 <br> 前面，避免后续格式操作表现成换行。
  placeCaretInEmptyParagraph(paragraph) {
    if (!paragraph) {
      return;
    }

    const range = document.createRange();

    // 空段落通常会被标准化成 <p><br /></p>。
    // 这里必须把光标放到占位 <br> 前面，而不是它后面；
    // 否则后续插入格式载体时，浏览器会表现得像“多按了一次回车”。
    if (
      paragraph.nodeType === Node.ELEMENT_NODE &&
      paragraph.childNodes.length === 1 &&
      paragraph.firstChild?.nodeType === Node.ELEMENT_NODE &&
      paragraph.firstChild.nodeName === "BR"
    ) {
      range.setStart(paragraph, 0);
    } else {
      range.setStart(paragraph, paragraph.childNodes.length);
    }

    range.collapse(true);
    setSelectionRange(range);
    this.savedRange = range.cloneRange();
  }

  // 标准化空编辑区结构。
  // 目标是无论用户如何删空内容，内部最终都收敛成稳定的 <p><br /></p> 结构。
  normalizeEditorEmptyState() {
    if (this.currentEditMode !== "html") {
      return;
    }

    const html = sanitizeHtml(this.editor.innerHTML || "");
    const text = htmlToText(html);
    const hasNonTextContent = /<(img|table|video|iframe|blockquote|pre|hr)\b/i.test(html);
    const hasPendingInlineCarrier = Boolean(this.editor.querySelector("[data-javaex-inline-carrier]"));

    if (text || hasNonTextContent || hasPendingInlineCarrier) {
      return;
    }

    const children = Array.from(this.editor.children || []);
    const blankParagraphs = children.filter((child) => this.isBlankParagraphLike(child));
    const onlyBlankParagraphs = children.length > 0 && blankParagraphs.length === children.length;

    if (onlyBlankParagraphs) {
      const normalizedHtml = blankParagraphs.map(() => "<p><br /></p>").join("");
      if (this.editor.innerHTML !== normalizedHtml) {
        this.editor.innerHTML = normalizedHtml;
      }
      this.placeCaretInEmptyParagraph(this.editor.lastElementChild || this.editor.querySelector("p"));
      this.setLabel("format", "p");
      return;
    }

    this.editor.innerHTML = "<p><br /></p>";
    this.placeCaretInEmptyParagraph(this.editor.querySelector("p") || this.editor);
    this.setLabel("format", "p");
  }

  // 初始化完成后重置空闲状态，避免编辑器一加载就带着焦点和选区。
  resetInitialIdleState() {
    const selection = window.getSelection?.();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      if (this.editor.contains(range.commonAncestorContainer)) {
        selection.removeAllRanges();
      }
    }

    if (document.activeElement === this.editor || document.activeElement === this.markdownEditor) {
      document.activeElement.blur();
    }

    this.savedRange = null;
    this.dialogSelectionRange = null;
  }

  // 向上查找最近一个带有指定内联样式的祖先节点。
  // 清除颜色、字号等样式时会依赖这个方法判断当前所处样式环境。
  findClosestStyledAncestor(node, propertyNames) {
    let current = node?.nodeType === Node.TEXT_NODE ? node.parentNode : node;
    while (current && current !== this.editor) {
      if (
        current.nodeType === Node.ELEMENT_NODE &&
        propertyNames.some((property) => current.style?.getPropertyValue(property))
      ) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  // 提供给扩展、AI、上传器的上下文对象。
  // 只暴露必要能力，避免外部直接依赖过多内部实现细节。
  createContext() {
    // 扩展、AI、上传器统一拿到的上下文对象，尽量保持能力边界稳定。
    return {
      html: this.getHtml(),
      text: this.getText(),
      markdown: this.getMarkdown(),
      focus: () => this.focus(),
      getLocale: () => this.getLocale(),
      setLocale: (locale, messages) => this.setLocale(locale, messages),
      getEditMode: () => this.getEditMode(),
      getHtml: () => this.getHtml(),
      getText: () => this.getText(),
      getMarkdown: () => this.getMarkdown(),
      insertHtml: (html) => this.insertHtml(html),
      setHtml: (html) => this.setHtml(html),
      openPreview: (tab = "preview") => this.openPreview(tab),
      showTip: (message, isError = false) => this.showTip(message, isError),
      openFormulaDialog: () => this.openFormulaDialog(),
      openAiChatDialog: () => this.openAiChatDialog()
    };
  }

  // 统一同步输出。
  // 包括：标准化内容、刷新预览、保存草稿、触发 callback/onChange。
  syncOutput() {
    this.normalizeEditorEmptyState();
    this.ensureTrailingEditableParagraph();
    const payload = {
      html: this.getHtml(),
      text: this.getText(),
      markdown: this.getMarkdown()
    };
    this.refreshEmptyState();
    this.refreshPreview();
    this.saveDraft();
    if (typeof this.options.callback === "function") {
      this.options.callback(payload);
    }
    if (typeof this.options.onChange === "function") {
      this.options.onChange(payload);
    }
  }

  // 销毁编辑器实例，清理所有局部和全局副作用。
  // 包括事件、弹层、计时器、全屏状态等。
  destroy() {
    // 销毁时除了卸载实例内事件，还要清理挂到 body 上的弹层和全局监听。
    if (this.tipTimer) {
      clearTimeout(this.tipTimer);
    }
    this.dialogs.forEach((mask) => {
      if (this.boundDialogMaskClick) {
        mask.removeEventListener("click", this.boundDialogMaskClick);
      }
      if (mask.parentNode === document.body) {
        mask.remove();
      }
    });
    if (this.tableContextMenu && this.boundTableContextClick) {
      this.tableContextMenu.removeEventListener("click", this.boundTableContextClick);
    }
    if (this.tableContextMenu?.parentNode === document.body) {
      this.tableContextMenu.remove();
    }
    if (this.tip?.parentNode === document.body) {
      this.tip.remove();
    }
    document.body.classList.remove("javaex-editor-body-fullscreen");
    this.host.removeEventListener("mousedown", this.boundRootMouseDown);
    this.host.removeEventListener("mousedown", this.boundRootMouseDown, true);
    this.host.removeEventListener("click", this.boundRootClick);
    this.host.removeEventListener("input", this.boundRootInput);
    this.editor.removeEventListener("input", this.boundEditorInput);
    this.editor.removeEventListener("paste", this.boundEditorPaste);
    this.markdownEditor.removeEventListener("input", this.boundMarkdownInput);
    this.editor.removeEventListener("mouseup", this.boundEditorSelection);
    this.editor.removeEventListener("keyup", this.boundEditorSelection);
    this.editor.removeEventListener("focus", this.boundEditorSelection);
    this.editor.removeEventListener("contextmenu", this.boundContextMenu);
    this.tablePicker.removeEventListener("mouseover", this.boundTableHover);
    this.imageInput.removeEventListener("change", this.boundImageChange);
    this.wordInput.removeEventListener("change", this.boundWordChange);
    this.colorDialogBoard.removeEventListener("mousedown", this.boundColorDialogMouseDown);
    this.colorDialogHue.removeEventListener("mousedown", this.boundColorDialogMouseDown);
    this.colorDialogR.removeEventListener("input", this.boundColorDialogInput);
    this.colorDialogG.removeEventListener("input", this.boundColorDialogInput);
    this.colorDialogB.removeEventListener("input", this.boundColorDialogInput);
    this.colorDialogHex.removeEventListener("input", this.boundColorDialogInput);
    document.removeEventListener("mousemove", this.boundColorDialogMouseMove);
    document.removeEventListener("mouseup", this.boundColorDialogMouseUp);
    document.removeEventListener("click", this.boundDocumentClick);
    document.removeEventListener("selectionchange", this.boundSelectionChange);
    document.removeEventListener("fullscreenchange", this.boundFullscreenChange);
    window.removeEventListener("resize", this.boundWindowUpdate);
    window.removeEventListener("scroll", this.boundWindowUpdate, true);
    window.removeEventListener("keydown", this.boundWindowKeydown);
    if (document.fullscreenElement === this.root && typeof document.exitFullscreen === "function") {
      document.exitFullscreen().catch(() => {});
    }
    document.body.classList.remove("javaex-editor-body-fullscreen");
  }
}

export function createEditor(target, options) {
  return new JavaexEditor(target, options);
}

export default JavaexEditor;


