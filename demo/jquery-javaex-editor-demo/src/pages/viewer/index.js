(function (Demo) {
  Demo.register({
    key: "viewer",
    title: "保存内容展示页",
    eyebrow: "代码块行号、语言标签和复制按钮",
    render: renderViewerPage
  });

  function renderViewerPage(ctx) {
    ctx.setActions('<button type="button" class="button button-primary" id="reloadViewer">刷新展示内容</button>');
    ctx.setContent('<section class="viewer-page"><article class="doc-body" id="viewerBody"></article></section>');
    $("#reloadViewer").on("click", renderViewerContent);
    renderViewerContent();
  }

  function renderViewerContent() {
    var html = localStorage.getItem(Demo.savedContentKey) || getViewerFallbackHtml();
    $("#viewerBody").html(html);
    enhanceCodeBlocks(document.getElementById("viewerBody"));
    if (window.decorateXiguaPlayers) {
      window.decorateXiguaPlayers(document.getElementById("viewerBody")).catch(function () {});
    }
  }

  function enhanceCodeBlocks(root) {
    if (!root) {
      return;
    }
    Array.from(root.querySelectorAll("pre")).forEach(function (pre) {
      if (pre.closest(".code-block")) {
        return;
      }
      var code = pre.querySelector("code") || pre;
      var codeText = normalizeCodeText(code);
      var language = detectLanguage(code) || "text";
      code.textContent = codeText;

      var wrapper = document.createElement("div");
      wrapper.className = "code-block";
      var numbers = document.createElement("div");
      numbers.className = "code-block__numbers";
      numbers.setAttribute("aria-hidden", "true");
      numbers.innerHTML = codeText.replace(/\n$/, "").split("\n").map(function (_, index) {
        return "<span>" + (index + 1) + "</span>";
      }).join("");

      var languageLabel = document.createElement("span");
      languageLabel.className = "code-block__language";
      languageLabel.textContent = language;

      var copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-block__copy";
      copyButton.textContent = "复制";
      copyButton.addEventListener("click", function () {
        copyCode(codeText, code).then(function () {
          copyButton.textContent = "复制成功";
          window.setTimeout(function () {
            copyButton.textContent = "复制";
          }, 2000);
        });
      });

      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(languageLabel);
      wrapper.appendChild(copyButton);
      wrapper.appendChild(numbers);
      wrapper.appendChild(pre);
    });
  }

  function normalizeCodeText(code) {
    return String(code.textContent || "").replace(/\r\n?/g, "\n").replace(/^\n+|\n+$/g, "");
  }

  function detectLanguage(code) {
    var match = String(code.className || "").match(/(?:language-|lang-)([a-z0-9_+-]+)/i);
    return match ? match[1].toLowerCase() : "";
  }

  async function copyCode(text, codeElement) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(codeElement);
    selection.removeAllRanges();
    selection.addRange(range);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    document.execCommand("copy");
  }

  function getViewerFallbackHtml() {
    return [
      "<h1>保存后的内容展示</h1>",
      "<p>这里展示富文本保存后在详情页中的渲染效果，包含表格、引用和代码块。</p>",
      "<table><thead><tr><th>能力</th><th>说明</th></tr></thead><tbody><tr><td>代码块</td><td>显示行号、语言和复制按钮</td></tr><tr><td>图片/视频</td><td>保持富文本内容原样展示</td></tr></tbody></table>",
      "<pre><code class=\"language-js\">function createEditorPage() {\n  const editor = JavaexEditor.createEditor('#editor', options);\n  editor.setHtml('<p>Hello javaexEditor</p>');\n  return editor.getHtml();\n}</code></pre>"
    ].join("");
  }
})(window.JavaexEditorDemo);
