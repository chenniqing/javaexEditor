import { javaexEditor } from "./lib";

// 演示页根节点。
const app = document.querySelector("#app");

// 为示例页动态注入一份轻量样式，避免影响库本身的发布产物。
const style = document.createElement("style");
style.textContent = `
  body {
    margin: 0;
    font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
    background: linear-gradient(180deg, #f8efe2 0%, #f6f4ef 36%, #f3f6f4 100%);
    color: #2f2418;
  }

  * {
    box-sizing: border-box;
  }

  .demo-page {
    max-width: 1320px;
    margin: 0 auto;
    padding: 40px 20px 80px;
  }

  .demo-card {
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid rgba(138, 98, 48, 0.14);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.84);
  }

  .demo-action {
    padding: 10px 14px;
    border: 1px solid rgba(188, 108, 37, 0.18);
    border-radius: 14px;
    background: #fff5e6;
    color: #8d531c;
    cursor: pointer;
  }

  .demo-output {
    max-height: 500px;
    overflow: auto;
    padding: 18px;
    border-radius: 18px;
    background: #1f1a14;
    color: #fdf6ee;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;
document.head.appendChild(style);

// 示例页结构：上方是说明和预览按钮，中间是编辑器，底部实时输出当前 HTML。
app.innerHTML = `
  <main class="demo-page">
    <section class="demo-card">
      <h1>javaexEditor</h1>
      <p>纯 JavaScript 版本，支持通过 <code>javaexEditor.editor({ id: "edit", ... })</code> 初始化。</p>
      <button type="button" class="demo-action" id="previewBtn">查看预览</button>
    </section>
    <section class="demo-card">
      <div id="edit"></div>
    </section>
    <section class="demo-card">
      <h2>当前输出</h2>
      <pre class="demo-output" id="htmlOutput"></pre>
    </section>
  </main>
`;

// 输出面板用于实时展示当前编辑器的 HTML 内容，便于调试格式行为。
const htmlOutput = document.querySelector("#htmlOutput");

// 初始化一个演示实例，直接把常用功能和新配置项都展示出来。
const editor = javaexEditor.editor({
  id: "edit",
  editorId: "demo-editor",
  // 最小高度：保证编辑区初始可见区域足够大。
  height: 360,
  // 最大高度：内容过多时由编辑区自身滚动，而不是把整页无限撑高。
  maxHeight: 560,
  // 工具栏距离浏览器顶部 12px 时开始吸顶。
  toolbarStickyTop: 12,
  value: `
    <h1>javaexEditor 示例</h1>
    <p>这里是 <strong>纯 JavaScript</strong> 版本的 javaexEditor 富文本编辑器。</p>
    <p>你可以试试这些能力：</p>
    <ul>
      <li>可视化插入表格</li>
      <li>上传多张本地图片</li>
      <li>右键编辑表格行列</li>
      <li>打开 AI 与预览面板</li>
    </ul>
  `,
  // 示例里的图片上传直接转成 base64，方便本地调试。
  async imageUploader(files) {
    return Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result, alt: file.name });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })));
  },
  // 每次内容变化时，把最新 HTML 同步到下方输出面板。
  callback(payload) {
    htmlOutput.textContent = payload.html;
  }
});

// 首次初始化后，立即把默认内容同步到输出面板。
htmlOutput.textContent = editor.getHtml();

// 点击“查看预览”按钮时，打开编辑器内置预览弹窗。
document.querySelector("#previewBtn")?.addEventListener("click", () => {
  editor.openPreview("preview");
});
