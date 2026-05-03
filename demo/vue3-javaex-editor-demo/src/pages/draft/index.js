import EditorExamplePage from "../shared/EditorExamplePage.vue";

export default {
  key: "draft",
  title: "未正常关闭检测示例",
  eyebrow: "展示上次页面未正常关闭的恢复提示",
  component: EditorExamplePage,
  value: "<p>当前内容和本地草稿不一致时，编辑器顶部会显示恢复提示。</p>",
  draftContent: "<h2>上次未保存的草稿</h2><p>这里模拟页面异常关闭前自动保存的内容。</p>"
};
