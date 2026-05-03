(function (Demo) {
  function createAiOptions(ctx) {
    return {
      enabled: true,
      request: function (messages) {
        return ctx.ajaxJson("/ai/chat", { questions: messages });
      },
      getResult: function (response) {
        return typeof response === "string" ? response : response?.content || response?.data || "";
      }
    };
  }

  Demo.register({
    key: "ai",
    title: "AI 功能试用示例",
    eyebrow: "jQuery 示例通过 $.ajax 调用后端",
    render: function (ctx) {
      Demo.renderEditorPage({
        key: "ai",
        title: "AI 功能试用示例",
        eyebrow: "jQuery 示例通过 $.ajax 调用后端",
        toolbar: Demo.toolbarNoAi.concat(["ai"]),
        createAiOptions: createAiOptions,
        value: "<p>选中一段文字后打开 AI 面板，可以试用一键润色或 AI 对话。</p>"
      });
    }
  });
})(window.JavaexEditorDemo);
