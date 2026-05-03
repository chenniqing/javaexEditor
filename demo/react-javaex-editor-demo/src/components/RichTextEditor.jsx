import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { createEditor } from "javaex-editor";

function toHtmlString(value) {
  return value == null ? "" : String(value);
}

const RichTextEditor = forwardRef(function RichTextEditor(
  {
    value = "",
    onValueChange,
    onChange,
    onReady,
    editorId = "rich-text-editor",
    placeholder = "请输入内容",
    height = 520,
    maxHeight,
    toolbar,
    emojiGroups,
    editorOptions = {}
  },
  ref
) {
  const hostRef = useRef(null);
  const editorRef = useRef(null);
  const valueRef = useRef(toHtmlString(value));
  const callbacksRef = useRef({ onValueChange, onChange, onReady });
  const resolvedMaxHeight = maxHeight === undefined ? height : maxHeight;

  const stableEditorOptions = useMemo(() => editorOptions, [editorOptions]);

  useEffect(() => {
    callbacksRef.current = { onValueChange, onChange, onReady };
  }, [onValueChange, onChange, onReady]);

  useEffect(() => {
    if (!hostRef.current || editorRef.current) {
      return undefined;
    }

    const editorConfig = {
      ...stableEditorOptions,
      editorId,
      value: valueRef.current,
      placeholder,
      height,
      maxHeight: resolvedMaxHeight,
      onChange(payload) {
        const html = toHtmlString(payload?.html);
        valueRef.current = html;
        callbacksRef.current.onValueChange?.(html);
        callbacksRef.current.onChange?.(payload);
      }
    };

    if (Array.isArray(toolbar)) {
      editorConfig.toolbar = toolbar;
    }
    if (Array.isArray(emojiGroups) && emojiGroups.length) {
      editorConfig.emojiGroups = emojiGroups;
    }

    editorRef.current = createEditor(hostRef.current, editorConfig);
    callbacksRef.current.onReady?.(editorRef.current);

    return () => {
      editorRef.current?.destroy?.();
      editorRef.current = null;
    };
  }, [editorId, placeholder, height, resolvedMaxHeight, toolbar, emojiGroups, stableEditorOptions]);

  useEffect(() => {
    const nextHtml = toHtmlString(value);
    valueRef.current = nextHtml;
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const currentHtml = toHtmlString(editor.getHtml?.());
    if (currentHtml !== nextHtml) {
      editor.setHtml(nextHtml, false);
    }
  }, [value]);

  useEffect(() => {
    editorRef.current?.setMinHeight?.(height);
  }, [height]);

  useEffect(() => {
    editorRef.current?.setMaxHeight?.(resolvedMaxHeight);
  }, [resolvedMaxHeight]);

  useImperativeHandle(ref, () => ({
    focus() {
      editorRef.current?.focus?.();
    },
    getHtml() {
      return editorRef.current?.getHtml?.() || valueRef.current;
    },
    getText() {
      return editorRef.current?.getText?.() || "";
    },
    getMarkdown() {
      return editorRef.current?.getMarkdown?.() || "";
    },
    setHtml(html, shouldEmit = false) {
      editorRef.current?.setHtml?.(toHtmlString(html), shouldEmit);
    },
    getInstance() {
      return editorRef.current;
    }
  }));

  return <div ref={hostRef} className="javaex-rich-text-editor-host" />;
});

export default RichTextEditor;
