(function (Demo) {
  Demo.register({
    key: "draft",
    title: "未正常关闭检测示例",
    eyebrow: "展示本地草稿恢复提示",
    render: function () {
      Demo.renderEditorPage({
        key: "draft",
        title: "未正常关闭检测示例",
        eyebrow: "展示本地草稿恢复提示",
        draftContent: "<h2>上次未保存的草稿</h2><p>这里模拟浏览器异常关闭前自动保存的内容。</p>",
        value: "<p>当前内容和本地草稿不一致时，编辑器顶部会显示恢复提示。</p>"
      });
    }
  });
})(window.JavaexEditorDemo);
