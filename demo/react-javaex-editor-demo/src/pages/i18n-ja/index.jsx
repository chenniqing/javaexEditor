import EditorExamplePage from "../shared/EditorExamplePage.jsx";
import { japaneseLocale } from "./locale.js";

export default {
  key: "i18n-ja",
  title: "多语言：日文",
  eyebrow: "仅富文本编辑器使用自定义 ja-JP 语言包",
  component: EditorExamplePage,
  locale: "ja-JP",
  locales: {
    "ja-JP": japaneseLocale
  },
  placeholder: "内容を入力してください...",
  value: "<p>このエディターはカスタム日本語パックを使用しています。</p>"
};
