(function (Demo) {
  Demo.register({
    key: "i18n-en",
    title: "多语言：英文",
    eyebrow: "仅富文本编辑器初始化为 en-US",
    render: function () {
      Demo.renderEditorPage({
        key: "i18n-en",
        title: "多语言：英文",
        eyebrow: "仅富文本编辑器初始化为 en-US",
        locale: "en-US",
        placeholder: "Enter rich text content",
        value: "<p>This editor is initialized in English.</p>"
      });
    }
  });
})(window.JavaexEditorDemo);
