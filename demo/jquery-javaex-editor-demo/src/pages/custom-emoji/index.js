(function (Demo, JavaexEditor) {
  var customEmojiGroups = [
    {
      key: "local",
      label: "本地表情",
      items: [
        { type: "image", label: "蓝色微笑", value: "./assets/emoji/blue-smile.svg" },
        { type: "image", label: "绿色确认", value: "./assets/emoji/green-ok.svg" }
      ]
    },
    {
      key: "remote",
      label: "远程表情",
      items: [
        { type: "image", label: "远程 Hi", value: "https://dummyimage.com/64x64/4f8cff/ffffff.png&text=Hi" },
        { type: "image", label: "远程 OK", value: "https://dummyimage.com/64x64/16a34a/ffffff.png&text=OK" }
      ]
    }
  ];

  Demo.register({
    key: "custom-emoji",
    title: "自定义表情：保留默认",
    eyebrow: "默认表情 + 本地表情包 + 远程地址表情",
    render: function () {
      Demo.renderEditorPage({
        key: "custom-emoji",
        title: "自定义表情：保留默认",
        eyebrow: "默认表情 + 本地表情包 + 远程地址表情",
        toolbar: ["emoji", "bold", "foreColor", "preview", "fullscreen"],
        emojiGroups: JavaexEditor.defaultEmojiGroups.concat(customEmojiGroups),
        value: "<p>打开表情面板，可以同时看到默认表情、本地 SVG 表情和远程地址表情。</p>"
      });
    }
  });
})(window.JavaexEditorDemo, window.JavaexEditor);
