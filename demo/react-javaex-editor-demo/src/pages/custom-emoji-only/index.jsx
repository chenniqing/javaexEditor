import EditorExamplePage from "../shared/EditorExamplePage.jsx";

const customEmojiGroups = [
  {
    key: "local",
    label: "本地表情",
    items: [
      { type: "image", label: "蓝色微笑", value: "/emoji/blue-smile.svg" },
      { type: "image", label: "绿色确认", value: "/emoji/green-ok.svg" }
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

export default {
  key: "custom-emoji-only",
  title: "自定义表情：去掉默认",
  eyebrow: "只保留本地表情包和远程地址表情",
  component: EditorExamplePage,
  toolbar: ["emoji", "bold", "foreColor", "preview", "fullscreen"],
  emojiGroups: customEmojiGroups,
  value: "<p>这个示例通过传入新的 emojiGroups 去掉默认表情，只展示自定义表情。</p>"
};
