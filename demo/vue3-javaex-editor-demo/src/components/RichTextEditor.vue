<template>
  <div ref="editorHost" class="javaex-rich-text-editor-host"></div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { createEditor } from "javaex-editor";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  editorId: {
    type: String,
    default: "rich-text-editor"
  },
  placeholder: {
    type: String,
    default: "请输入内容"
  },
  height: {
    type: [Number, String],
    default: 520
  },
  maxHeight: {
    type: [Number, String, null],
    default: undefined
  },
  toolbar: {
    type: Array,
    default: undefined
  },
  emojiGroups: {
    type: Array,
    default: undefined
  },
  editorOptions: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:modelValue", "change", "ready"]);
const editorHost = ref(null);
const editorInstance = shallowRef(null);
const htmlValue = computed(() => toHtmlString(props.modelValue));
const resolvedMaxHeight = computed(() => (props.maxHeight === undefined ? props.height : props.maxHeight));

function toHtmlString(value) {
  return value == null ? "" : String(value);
}

async function createEditorInstance() {
  if (editorInstance.value) {
    return;
  }
  await nextTick();
  if (!editorHost.value) {
    return;
  }

  const editorConfig = {
    ...props.editorOptions,
    editorId: props.editorId,
    value: htmlValue.value,
    placeholder: props.placeholder,
    height: props.height,
    maxHeight: resolvedMaxHeight.value,
    onChange(payload) {
      const html = toHtmlString(payload?.html);
      emit("update:modelValue", html);
      emit("change", payload);
    }
  };

  if (Array.isArray(props.toolbar)) {
    editorConfig.toolbar = props.toolbar;
  }
  if (Array.isArray(props.emojiGroups) && props.emojiGroups.length) {
    editorConfig.emojiGroups = props.emojiGroups;
  }

  editorInstance.value = createEditor(editorHost.value, editorConfig);
  emit("ready", editorInstance.value);
}

function destroyEditorInstance() {
  editorInstance.value?.destroy?.();
  editorInstance.value = null;
}

function syncEditorContent(value) {
  const editor = editorInstance.value;
  if (!editor) {
    return;
  }
  const nextHtml = toHtmlString(value);
  const currentHtml = toHtmlString(editor.getHtml?.());
  if (currentHtml !== nextHtml) {
    editor.setHtml(nextHtml, false);
  }
}

onMounted(createEditorInstance);
onBeforeUnmount(destroyEditorInstance);

watch(() => props.modelValue, syncEditorContent);
watch(() => props.height, (value) => {
  editorInstance.value?.setMinHeight?.(value);
});
watch(resolvedMaxHeight, (value) => {
  editorInstance.value?.setMaxHeight?.(value);
});

defineExpose({
  focus() {
    editorInstance.value?.focus?.();
  },
  getHtml() {
    return editorInstance.value?.getHtml?.() || htmlValue.value;
  },
  getText() {
    return editorInstance.value?.getText?.() || "";
  },
  getMarkdown() {
    return editorInstance.value?.getMarkdown?.() || "";
  },
  setHtml(html, shouldEmit = false) {
    editorInstance.value?.setHtml?.(toHtmlString(html), shouldEmit);
  },
  getInstance() {
    return editorInstance.value;
  }
});
</script>

<style scoped>
.javaex-rich-text-editor-host {
  width: 100%;
  min-width: 0;
}
</style>
