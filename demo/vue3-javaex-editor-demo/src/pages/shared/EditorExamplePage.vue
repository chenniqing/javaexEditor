<template>
  <header class="demo-header">
    <div>
      <p class="eyebrow">{{ page.eyebrow }}</p>
      <h2>{{ page.title }}</h2>
    </div>
    <div class="demo-actions">
      <button type="button" class="button" @click="readHtml">读取 HTML</button>
      <button type="button" class="button button-primary" @click="saveCurrentContent">保存到展示页</button>
    </div>
  </header>

  <section class="panel">
    <RichTextEditor
      ref="editorRef"
      v-model="editorHtml"
      :editor-id="currentEditorId"
      :height="460"
      :max-height="620"
      :toolbar="page.toolbar || toolbarNoAi"
      :emoji-groups="page.emojiGroups"
      :editor-options="editorOptions"
      :placeholder="editorPlaceholder"
      @change="handleEditorChange"
      @ready="handleEditorReady"
    />
  </section>
  <section class="panel">
    <div class="result-grid">
      <label class="result-box">
        <span>HTML</span>
        <textarea :value="htmlOutput" readonly></textarea>
      </label>
      <label class="result-box">
        <span>纯文本</span>
        <textarea :value="textOutput" readonly></textarea>
      </label>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import RichTextEditor from "../../components/RichTextEditor.vue";
import { getDefaultEditorHtml, savedContentKey } from "./content.js";
import { toolbarNoAi } from "./toolbar.js";

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
});

const baseApi = import.meta.env.VITE_BASE_API || "http://127.0.0.1:7001";
const editorRef = ref(null);
const rawEditor = ref(null);
const editorHtml = ref("");
const htmlOutput = ref("");
const textOutput = ref("");
const currentEditorId = computed(() => `vue3-demo-${props.page.key}`);
const editorPlaceholder = computed(() => {
  if (props.page.placeholder) {
    return props.page.placeholder;
  }
  if (props.page.locale === "en-US") {
    return "Enter rich text content";
  }
  if (props.page.locale === "ja-JP") {
    return "内容を入力してください...";
  }
  return "请输入富文本内容";
});
const editorOptions = computed(() => {
  const extraOptions = props.page.createEditorOptions?.({ postJson }) || {};
  return {
    locale: props.page.locale || "zh-CN",
    locales: props.page.locales || {},
    ai: { enabled: false },
    ...extraOptions
  };
});

watch(
  () => props.page,
  async (page) => {
    rawEditor.value = null;
    htmlOutput.value = "";
    textOutput.value = "";
    if (page.draftContent) {
      seedDraft(currentEditorId.value, page.draftContent);
    }
    editorHtml.value = page.value || getDefaultEditorHtml();
    await nextTick();
  },
  { immediate: true }
);

function readHtml() {
  const editor = editorRef.value;
  if (!editor) {
    return;
  }
  htmlOutput.value = editor.getHtml();
  textOutput.value = editor.getText();
}

function saveCurrentContent() {
  const editor = editorRef.value;
  const instance = rawEditor.value;
  if (!editor || !instance) {
    return;
  }
  localStorage.setItem(savedContentKey, editor.getHtml());
  instance.showTip("已保存到展示页");
}

function handleEditorChange(payload) {
  htmlOutput.value = payload.html || "";
  textOutput.value = payload.text || "";
}

function handleEditorReady(instance) {
  rawEditor.value = instance;
  htmlOutput.value = instance.getHtml();
  textOutput.value = instance.getText();
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
</script>
