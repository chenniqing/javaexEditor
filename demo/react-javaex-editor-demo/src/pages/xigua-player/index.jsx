import EditorExamplePage from "../shared/EditorExamplePage.jsx";
import { toolbarNoAi } from "../shared/toolbar.js";
import { createXiguaPlayerExtension } from "../../utils/editor-extensions/xigua-player.js";

export default {
  key: "xigua",
  title: "扩展功能：西瓜播放器",
  eyebrow: "通过 extensions 注册工具栏按钮",
  component: EditorExamplePage,
  toolbar: toolbarNoAi.concat(["separator", "xigua-player"]),
  value: "<p>点击工具栏中的西瓜播放器按钮，插入一个业务扩展播放器。</p>",
  createEditorOptions() {
    return {
      extensions: [
        createXiguaPlayerExtension({
          poster: "",
          prompts: {
            dialogTitle: "插入西瓜播放器",
            urlLabel: "视频地址",
            urlPlaceholder: "请输入西瓜播放器视频地址",
            titleLabel: "视频标题",
            titlePlaceholder: "可选",
            posterLabel: "封面图片",
            posterPlaceholder: "可选图片地址",
            confirmText: "插入",
            cancelText: "取消",
            requiredMessage: "请先输入视频地址"
          },
          render: ({ buildHtml, url, poster, title }) => buildHtml({
            url,
            poster,
            title,
            height: 360
          })
        })
      ]
    };
  }
};
