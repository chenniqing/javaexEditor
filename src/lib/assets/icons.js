import ai from "./icons/ai.svg?raw";
import alignCenter from "./icons/align_center.svg?raw";
import alignLeft from "./icons/align_left.svg?raw";
import alignRight from "./icons/align_right.svg?raw";
import backgroundColor from "./icons/background_color.svg?raw";
import bold from "./icons/bold.svg?raw";
import chevronDown from "./icons/chevron_down.svg?raw";
import chevronRight from "./icons/chevron_right.svg?raw";
import clearBackgroundColor from "./icons/clear_background_color.svg?raw";
import clearFormat from "./icons/clear_format.svg?raw";
import code from "./icons/code.svg?raw";
import defaultColor from "./icons/default_color.svg?raw";
import divider from "./icons/divider.svg?raw";
import emoji from "./icons/emoji.svg?raw";
import fontColor from "./icons/font_color.svg?raw";
import fullscreen from "./icons/fullscreen.svg?raw";
import indentLeft from "./icons/indent_left.svg?raw";
import indentRight from "./icons/indent_right.svg?raw";
import italic from "./icons/italic.svg?raw";
import link from "./icons/link.svg?raw";
import mathFormula from "./icons/math_formula.svg?raw";
import orderedList from "./icons/ordered_list.svg?raw";
import pdf from "./icons/pdf.svg?raw";
import print from "./icons/print.svg?raw";
import preview from "./icons/preview.svg?raw";
import quote from "./icons/quote.svg?raw";
import redo from "./icons/redo.svg?raw";
import selectAll from "./icons/select_all.svg?raw";
import send from "./icons/send.svg?raw";
import strikethrough from "./icons/strikethrough.svg?raw";
import subscript from "./icons/subscript.svg?raw";
import superscript from "./icons/superscript.svg?raw";
import table from "./icons/table.svg?raw";
import underline from "./icons/underline.svg?raw";
import undo from "./icons/undo.svg?raw";
import unlink from "./icons/unlink.svg?raw";
import unorderedList from "./icons/unordered_list.svg?raw";
import uploadImage from "./icons/upload_image.svg?raw";
import uploadVideo from "./icons/upload_video.svg?raw";
import word from "./icons/word.svg?raw";

export const iconSvgs = {
  ai,
  alignCenter,
  alignLeft,
  alignRight,
  backgroundColor,
  bold,
  chevronDown,
  chevronRight,
  clearBackgroundColor,
  clearFormat,
  code,
  defaultColor,
  divider,
  emoji,
  fontColor,
  fullscreen,
  indentLeft,
  indentRight,
  italic,
  link,
  mathFormula,
  orderedList,
  pdf,
  print,
  preview,
  quote,
  redo,
  selectAll,
  send,
  strikethrough,
  subscript,
  superscript,
  table,
  underline,
  undo,
  unlink,
  unorderedList,
  uploadImage,
  uploadVideo,
  word
};

export function renderIconSvg(name) {
  return iconSvgs[name] || "";
}
