(function (Demo) {
  Demo.register({
    key: "default",
    title: "默认示例",
    eyebrow: "全部工具栏，不包含 AI",
    render: function () {
      Demo.renderEditorPage({
        key: "default",
        title: "默认示例",
        eyebrow: "全部工具栏，不包含 AI"
      });
    }
  });
})(window.JavaexEditorDemo);
