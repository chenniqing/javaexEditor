import JavaexEditor, { createEditor, deleteTextEditorDraft } from "./core/JavaexEditor";
import { defaultEmojiGroups } from "./utils/content";
export {
  createImageEmojiGroup,
  createPublicImageEmojiGroup,
  parseImageEmojiItems
} from "./utils/emoji.js";
export {
  DEFAULT_RICH_TEXT_CONTENT_STYLE,
  DEFAULT_RICH_TEXT_PREVIEW_STYLE,
  buildRichTextContentHtml,
  buildRichTextDisplayHtml,
  buildRichTextPreviewDocument,
  createRichTextRuntime,
  decorateRichTextImages,
  decorateRichTextCodeBlocks,
  ensureCodeCopyButton,
  ensureRichTextContentStyles,
  loadRichTextScript,
  normalizeCodeText,
  renderCodeLineNumbers,
  selectCodeContent
} from "./utils/rich-content.js";

export const javaexEditor = {
  editor(options = {}) {
    const target = options.target || (options.id ? `#${options.id}` : null);
    return createEditor(target, options);
  },
  edit(options = {}) {
    const target = options.target || (options.id ? `#${options.id}` : null);
    return createEditor(target, options);
  },
  deleteTextEditorDraft
};

if (typeof window !== "undefined") {
  window.javaexEditor = Object.assign(window.javaexEditor || {}, javaexEditor);
  window.javaex = Object.assign(window.javaex || {}, {
    editor: javaexEditor.editor,
    edit: javaexEditor.edit,
    deleteTextEditorDraft
  });
}

export { JavaexEditor, createEditor, deleteTextEditorDraft, defaultEmojiGroups };

export default JavaexEditor;
