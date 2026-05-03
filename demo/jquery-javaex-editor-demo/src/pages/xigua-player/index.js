(function (Demo) {
  function createExtensions() {
    return [
      window.createXiguaPlayerExtension({
        poster: "",
        prompts: {
          urlLabel: "视频地址",
          urlPlaceholder: "请输入西瓜播放器视频地址",
          titleLabel: "视频标题",
          titlePlaceholder: "可选",
          posterLabel: "封面图片",
          posterPlaceholder: "可选，填写图片 URL"
        },
        render: function (payload) {
          return payload.buildHtml({
            url: payload.url,
            poster: payload.poster,
            title: payload.title,
            height: 360
          });
        }
      })
    ];
  }

  Demo.register({
    key: "xigua",
    title: "扩展功能：西瓜播放器",
    eyebrow: "通过 extensions 注册工具栏按钮",
    render: function () {
      Demo.renderEditorPage({
        key: "xigua",
        title: "扩展功能：西瓜播放器",
        eyebrow: "通过 extensions 注册工具栏按钮",
        toolbar: Demo.toolbarNoAi.concat(["separator", "xigua-player"]),
        createExtensions: createExtensions,
        value: "<p>点击工具栏中的西瓜播放器按钮，插入一个业务扩展播放器。</p>"
      });
    }
  });
})(window.JavaexEditorDemo);
