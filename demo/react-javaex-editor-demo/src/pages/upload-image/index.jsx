import EditorExamplePage from "../shared/EditorExamplePage.jsx";
import { uploadImagesToImgbb } from "../../utils/image-upload.js";

export default {
  key: "upload-image",
  title: "上传图片示例",
  eyebrow: "通过 imgbb 接口上传并插入远程图片地址",
  component: EditorExamplePage,
  toolbar: ["image", "preview", "fullscreen"],
  value: "<p>点击图片按钮选择本地图片，示例会通过 imgbb 接口上传后插入远程图片。</p>",
  createEditorOptions() {
    return {
      imageUploader: uploadImagesToImgbb
    };
  }
};
