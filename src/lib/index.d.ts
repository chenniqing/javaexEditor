/** 表情分组配置。 */
export interface EmojiGroup {
  key: string;
  label: string;
  items: Array<string | { label?: string; value: string; type?: "text" | "image" }>;
}

/** 图片上传器返回的标准对象结构。 */
export interface UploadImageItem {
  url: string;
  alt?: string;
  title?: string;
  attrs?: Record<string, string>;
}

/** 兼容旧版 javaex.edit({ image: ... }) 的图片上传配置。 */
export interface LegacyImageUploadOptions {
  url: string;
  method?: string;
  param?: Record<string, string | number | boolean | null | undefined> & { file?: string };
  header?: Record<string, string>;
  dataType?: "base64" | "url";
  isShowTip?: boolean;
  sendCookie?: boolean;
  crossDomain?: boolean;
  prefix?: string;
  imgUrl?: string;
}

/** 编辑器对外暴露的基础内容载荷。 */
export interface EditorPayload {
  html: string;
  text: string;
  markdown: string;
}

/** 提供给扩展、AI、上传器的上下文对象。 */
export interface EditorContext extends EditorPayload {
  focus: () => void;
  getHtml: () => string;
  getText: () => string;
  getMarkdown: () => string;
  getEditMode: () => "html" | "markdown";
  insertHtml: (html: string) => void;
  setHtml: (html: string) => void;
  openPreview: (tab?: "preview" | "markdown") => void;
  showTip: (message: string, isError?: boolean) => void;
  openFormulaDialog: () => void;
  openAiChatDialog: () => void;
}

/** 扩展动作定义，既可以放进 AI 面板，也可以预留给其他区域。 */
export interface EditorExtension {
  key: string;
  label: string;
  shortLabel?: string;
  title?: string;
  description?: string;
  placement?: "toolbar" | "ai";
  /** placement 为 toolbar 时，可用内置图标名渲染工具栏图标。 */
  iconName?: string;
  /** placement 为 toolbar 时，可传入业务自己的 SVG 字符串。 */
  icon?: string;
  /** placement 为 toolbar 时，可传入业务自己的 SVG 字符串，优先级高于 icon。 */
  iconSvg?: string;
  /** 工具栏扩展默认不在 Markdown 模式执行；确实需要执行时设为 true。 */
  allowMarkdown?: boolean;
  action: (context: EditorContext) => void | Promise<void>;
}

/** 编辑器初始化配置。 */
export interface JavaexEditorOptions {
  /** 挂载目标，可以是选择器或真实 DOM 节点。 */
  target?: string | HTMLElement;
  /** 目标节点 id，作为 target 的便捷写法。 */
  id?: string;
  /** 编辑器实例 id，用于草稿隔离等场景。 */
  editorId?: string;
  /** 初始 HTML 内容。 */
  value?: string;
  /** 与 value 等价，兼容常见双向绑定命名。 */
  modelValue?: string;
  /** 占位提示文本。 */
  placeholder?: string;
  /** 编辑区最小高度。 */
  height?: number | string;
  /** 编辑区最大高度，超出后内部滚动。 */
  maxHeight?: number | string | null;
  /** 是否禁用整个编辑器。 */
  disabled?: boolean;
  /** 初始编辑模式：HTML 或 Markdown。 */
  editMode?: "html" | "markdown";
  /** 预览展示方式：弹窗或分栏。 */
  previewMode?: "dialog" | "split";
  /** 工具栏距离顶部多少时吸顶；为空则不吸顶。 */
  toolbarStickyTop?: number | string | null;
  /** 自定义工具栏项顺序。 */
  toolbar?: string[];
  /** 自定义表情分组。 */
  emojiGroups?: EmojiGroup[];
  /** 自定义扩展动作。 */
  extensions?: EditorExtension[];
  /** AI 相关能力配置。 */
  ai?: {
    enabled?: boolean;
    request?: (
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
      payload: EditorPayload & { prompt?: string; selectionHtml?: string; selectionText?: string; targetHtml?: string },
      context: EditorContext
    ) => Promise<unknown> | unknown;
    getResult?: (response: unknown, payload?: EditorPayload) => string;
    resolveResult?: (response: unknown, payload?: EditorPayload) => string;
    resultResolver?: (response: unknown, payload?: EditorPayload) => string;
    prompts?: {
      polishSystem?: string | ((payload: EditorPayload) => string);
      polishUser?: string | ((payload: EditorPayload) => string);
      chatSystem?: string | ((payload: EditorPayload & { prompt: string; scopeText: string; targetHtml: string; hasSelection: boolean }) => string);
      chatUser?: string | ((payload: EditorPayload & { prompt: string; scopeText: string; targetHtml: string; hasSelection: boolean }) => string);
    };
    polishSystemPrompt?: string;
    polishUserPrompt?: string;
    chatSystemPrompt?: string;
    chatUserPrompt?: string;
    polish?: (payload: EditorPayload) => Promise<string | { html?: string; markdown?: string }> | string | { html?: string; markdown?: string };
    chat?: (
      payload: EditorPayload & { prompt: string; selectionHtml?: string; selectionText?: string },
      context: EditorContext
    ) => Promise<string | { html?: string; text?: string }> | string | { html?: string; text?: string };
  };
  formula?: {
    enabled?: boolean;
    render?: (
      payload: EditorPayload & { source: string; display: "inline" | "block" },
      context: EditorContext
    ) => Promise<string | void> | string | void;
  };
  /** 兼容旧版 javaex.edit({ image: ... }) 的图片上传配置。 */
  image?: LegacyImageUploadOptions | null;
  /** 推荐使用的图片上传回调。 */
  imageUploader?: (files: File[], context: EditorContext) => Promise<Array<string | UploadImageItem> | string | UploadImageItem>;
  /** 兼容旧版的内容变更回调。 */
  callback?: (payload: EditorPayload) => void;
  /** 推荐使用的内容变更回调。 */
  onChange?: (payload: EditorPayload) => void;
}

/** 编辑器实例公开方法。 */
export declare class JavaexEditor {
  constructor(target: string | HTMLElement | JavaexEditorOptions, options?: JavaexEditorOptions);
  /** 聚焦到当前编辑模式对应的输入区域。 */
  focus(): void;
  /** 获取当前编辑模式。 */
  getEditMode(): "html" | "markdown";
  /** 切换编辑模式。 */
  setEditMode(mode: "html" | "markdown"): void;
  /** 获取当前 HTML。 */
  getHtml(): string;
  /** 获取纯文本内容。 */
  getText(): string;
  /** 获取 Markdown 内容。 */
  getMarkdown(): string;
  /** 在当前光标处插入 HTML。 */
  insertHtml(html: string): void;
  /** 直接整体设置 HTML 内容。 */
  setHtml(html: string, shouldEmit?: boolean): void;
  /** 设置编辑区最小高度。 */
  setMinHeight(height: number | string): void;
  /** 设置编辑区最大高度。 */
  setMaxHeight(height: number | string | null): void;
  /** 设置工具栏吸顶偏移量。 */
  setToolbarStickyTop(offset: number | string | null): void;
  /** 打开预览。 */
  openPreview(tab?: "preview" | "markdown"): void;
  /** 删除当前实例对应的本地草稿。 */
  deleteTextEditorDraft(): void;
  /** 恢复当前实例对应的本地草稿。 */
  recoverDraft(): void;
  /** 销毁编辑器实例。 */
  destroy(): void;
}

/** 创建编辑器实例。 */
export declare function createEditor(target: string | HTMLElement | JavaexEditorOptions, options?: JavaexEditorOptions): JavaexEditor;
/** 删除指定 editorId 对应的草稿。 */
export declare function deleteTextEditorDraft(editorId: string): void;

/** UMD / 全局场景下暴露的统一入口。 */
export declare const javaexEditor: {
  editor: (options?: JavaexEditorOptions) => JavaexEditor;
  edit: (options?: JavaexEditorOptions) => JavaexEditor;
  deleteTextEditorDraft: (editorId: string) => void;
};

/** 默认表情分组数据。 */
export declare const defaultEmojiGroups: EmojiGroup[];

/** 把“名称|图片地址,名称|图片地址”解析成图片表情项。 */
export declare function parseImageEmojiItems(value?: string): Array<{ type: "image"; label: string; value: string }>;
/** 根据 public 目录下的图片文件名创建图片表情组。 */
export declare function createPublicImageEmojiGroup(options?: {
  key?: string;
  label?: string;
  files?: string[];
  baseUrl?: string;
  publicPath?: string;
}): EmojiGroup;
/** 根据已有图片表情项创建图片表情组。 */
export declare function createImageEmojiGroup(options?: {
  key?: string;
  label?: string;
  items?: EmojiGroup["items"];
}): EmojiGroup;

export declare function normalizeCodeText(block: Element | null): string;
export declare function renderCodeLineNumbers(codeText: string): string;
export declare function selectCodeContent(target: Element | null): void;
export declare const DEFAULT_RICH_TEXT_CONTENT_STYLE: string;
export declare function ensureRichTextContentStyles(style?: string, styleId?: string): void;
export declare function decorateRichTextImages(container: Element | null): void;
export declare function ensureCodeCopyButton(pre: Element | null, codeText: string, options?: {
  buttonClass?: string;
  copyText?: string;
  copiedText?: string;
  feedbackDuration?: number;
}): void;
export declare function decorateRichTextCodeBlocks(container: Element | null, options?: {
  codeClass?: string;
  buttonClass?: string;
  copyText?: string;
  copiedText?: string;
  feedbackDuration?: number;
  highlightElement?: ((block: Element) => void) | null;
  lineNumbersBlock?: ((block: Element) => void) | null;
  force?: boolean;
}): void;
export declare function buildRichTextContentHtml(source: string, options?: {
  buttonClass?: string;
  copyText?: string;
}): string;
export declare function buildRichTextDisplayHtml(source: string): string;
export declare function buildRichTextPreviewDocument(options?: {
  title?: string;
  content?: string;
  style?: string;
  buttonClass?: string;
  copyText?: string;
  copiedText?: string;
}): string;
export declare const DEFAULT_RICH_TEXT_PREVIEW_STYLE: string;
export declare function loadRichTextScript(src: string): Promise<void>;
export declare function createRichTextRuntime(options?: {
  highlightScripts?: string[];
  previewStyle?: string;
  contentStyle?: string;
  contentStyleId?: string;
  injectContentStyle?: boolean;
  buttonClass?: string;
  copyText?: string;
  copiedText?: string;
  getHighlightRuntime?: () => {
    highlightElement?: ((block: Element) => void) | null;
    lineNumbersBlock?: ((block: Element) => void) | null;
  };
}): {
  ensureHighlightRuntime: () => Promise<void>;
  decorate: (container: Element | null, options?: {
    codeClass?: string;
    buttonClass?: string;
    copyText?: string;
    copiedText?: string;
    feedbackDuration?: number;
    highlightElement?: ((block: Element) => void) | null;
    lineNumbersBlock?: ((block: Element) => void) | null;
    force?: boolean;
  }) => Promise<void>;
  buildContentHtml: (content: string, options?: {
    buttonClass?: string;
    copyText?: string;
  }) => string;
  buildDisplayHtml: (content: string) => string;
  buildPreviewHtml: (options?: {
    title?: string;
    content?: string;
  }) => string;
  openPreview: (options?: {
    title?: string;
    content?: string;
    blockedMessage?: string;
  }) => Promise<boolean>;
};

export default JavaexEditor;
