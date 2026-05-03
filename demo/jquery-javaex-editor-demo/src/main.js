(function ($, JavaexEditor) {
  var savedContentKey = "javaex-editor-demo-saved-content";
  var currentEditor = null;
  var pages = [];

  var toolbarNoAi = [
    "font", "size", "format", "separator",
    "image", "video", "importWord", "separator",
    "link", "unlink", "undo", "redo", "separator",
    "bold", "italic", "underline", "strike", "superscript", "subscript",
    "foreColor", "backColor", "separator",
    "hr", "selectAll", "removeFormat", "separator",
    "indent", "outdent", "justifyLeft", "justifyCenter", "justifyRight", "separator",
    "orderedList", "unorderedList", "table", "quote", "code", "formula", "separator",
    "emoji", "preview", "fullscreen"
  ];

  window.javaexEditor = window.javaexEditor || JavaexEditor.javaexEditor;
  window.JavaexEditorDemo = {
    savedContentKey: savedContentKey,
    toolbarNoAi: toolbarNoAi,
    register: register,
    renderEditorPage: renderEditorPage,
    ajaxJson: ajaxJson,
    escapeHtml: escapeHtml
  };

  function register(page) {
    pages.push(page);
  }

  function init() {
    renderNav();
    $(window).on("hashchange", renderCurrentPage);
    if (!location.hash) {
      location.hash = "#default";
    } else {
      renderCurrentPage();
    }
  }

  function renderNav() {
    $("#demoNav").html(pages.map(function (page) {
      return '<a href="#' + page.key + '" data-page-link="' + page.key + '">' + escapeHtml(page.title) + "</a>";
    }).join(""));
  }

  function renderCurrentPage() {
    var key = (location.hash || "#default").slice(1);
    var page = pages.find(function (item) { return item.key === key; }) || pages[0];
    if (!page) {
      return;
    }

    $("[data-page-link]").toggleClass("is-active", false);
    $('[data-page-link="' + page.key + '"]').toggleClass("is-active", true);
    $("#pageTitle").text(page.title);
    $("#pageEyebrow").text(page.eyebrow);
    $("#pageActions").empty();
    destroyEditor();
    page.render(createPageContext(page));
  }

  function createPageContext(page) {
    return {
      $: $,
      JavaexEditor: JavaexEditor,
      savedContentKey: savedContentKey,
      toolbarNoAi: toolbarNoAi,
      page: page,
      renderEditorPage: renderEditorPage,
      setActions: function (html) {
        $("#pageActions").html(html);
      },
      setContent: function (html) {
        $("#demoContent").html(html);
      },
      ajaxJson: ajaxJson,
      destroyEditor: destroyEditor,
      getEditor: function () {
        return currentEditor;
      },
      escapeHtml: escapeHtml
    };
  }

  function renderEditorPage(page) {
    var editorId = "jquery-demo-" + page.key;
    if (page.draftContent) {
      seedDraft(editorId, page.draftContent);
    }

    $("#pageActions").html(
      '<button type="button" class="button" id="readHtml">读取 HTML</button>' +
      '<button type="button" class="button button-primary" id="saveContent">保存到展示页</button>'
    );
    $("#demoContent").html(
      '<section class="panel"><div class="editor-host" id="editorHost"></div></section>' +
      '<section class="panel">' +
      '<div class="result-grid">' +
      '<label class="result-box"><span>HTML</span><textarea id="htmlOutput" readonly></textarea></label>' +
      '<label class="result-box"><span>纯文本</span><textarea id="textOutput" readonly></textarea></label>' +
      '</div>' +
      '</section>'
    );

    currentEditor = JavaexEditor.createEditor("#editorHost", {
      editorId: editorId,
      value: page.value || getDefaultEditorHtml(),
      placeholder: page.placeholder || "请输入富文本内容",
      height: 460,
      maxHeight: 620,
      toolbar: page.toolbar || toolbarNoAi,
      locale: page.locale || "zh-CN",
      locales: page.locales || {},
      emojiGroups: page.emojiGroups || JavaexEditor.defaultEmojiGroups,
      extensions: typeof page.createExtensions === "function" ? page.createExtensions() : [],
      imageUploader: page.imageUploader,
      ai: typeof page.createAiOptions === "function" ? page.createAiOptions(createPageContext(page)) : { enabled: false },
      onChange: syncOutput
    });

    syncOutput({
      html: currentEditor.getHtml(),
      text: currentEditor.getText()
    });

    $("#readHtml").on("click", function () {
      syncOutput({
        html: currentEditor.getHtml(),
        text: currentEditor.getText()
      });
    });
    $("#saveContent").on("click", saveCurrentContent);
  }

  function syncOutput(payload) {
    $("#htmlOutput").val(payload.html || "");
    $("#textOutput").val(payload.text || "");
  }

  function saveCurrentContent() {
    if (!currentEditor) {
      return;
    }
    localStorage.setItem(savedContentKey, currentEditor.getHtml());
    currentEditor.showTip("已保存到展示页");
  }

  function seedDraft(editorId, draftContent) {
    var key = "javaex-edit-content_" + editorId;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, draftContent);
    }
  }

  function ajaxJson(path, body) {
    var baseApi = window.JQUERY_JAVAEX_EDITOR_DEMO_API || "http://127.0.0.1:7001";
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: baseApi + path,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(body)
      })
        .done(function (response) {
          if (!response || response.code !== 0) {
            reject(new Error(response?.message || "请求失败"));
            return;
          }
          resolve(response.data);
        })
        .fail(function (xhr) {
          var message = xhr.responseJSON?.message || xhr.statusText || "请求失败";
          reject(new Error(message));
        });
    });
  }

  function destroyEditor() {
    if (currentEditor?.destroy) {
      currentEditor.destroy();
    }
    currentEditor = null;
  }

  function getDefaultEditorHtml() {
    return "<h2>javaexEditor 默认示例</h2><p>这个页面展示除 AI 以外的全部内置工具栏能力。</p><pre><code class=\"language-js\">const editor = JavaexEditor.createEditor('#editor', options);</code></pre>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  $(init);
})(window.jQuery, window.JavaexEditor);
