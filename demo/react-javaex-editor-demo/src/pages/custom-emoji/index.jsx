import { defaultEmojiGroups } from "javaex-editor";
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
  key: "custom-emoji",
  title: "自定义表情：保留默认",
  eyebrow: "默认表情 + 本地表情包 + 远程地址表情",
  component: EditorExamplePage,
  toolbar: ["emoji", "bold", "foreColor", "preview", "fullscreen"],
  emojiGroups: defaultEmojiGroups.concat(customEmojiGroups),
  value: "<p>打开表情面板，可以同时看到默认表情、本地 SVG 表情和远程地址表情。</p>"
};
