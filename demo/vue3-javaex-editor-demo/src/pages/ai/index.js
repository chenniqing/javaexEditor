import EditorExamplePage from "../shared/EditorExamplePage.vue";
import { toolbarNoAi } from "../shared/toolbar.js";

export default {
  key: "ai",
  title: "AI 功能试用示例",
  eyebrow: "调用配置的 AI 接口",
  component: EditorExamplePage,
  toolbar: toolbarNoAi.concat(["ai"]),
  value: "<p>选中一段文字后打开 AI 面板，可以试用一键润色或 AI 对话。</p>",
  createEditorOptions({ postJson }) {
    return {
      ai: {
        enabled: true,
        request(messages) {
          return postJson("/ai/chat", { questions: messages });
        },
        getResult(response) {
          return typeof response === "string" ? response : response?.content || response?.data || "";
        }
      }
    };
  }
};
