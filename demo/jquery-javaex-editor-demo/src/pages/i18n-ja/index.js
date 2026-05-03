(function (Demo) {
  var japaneseLocale = {
    toolbar: {
      image: "画像",
      video: "動画",
      importWord: "Word 取込",
      fullscreen: "全画面",
      exitFullscreen: "全画面終了",
      link: "リンク",
      unlink: "リンク解除",
      undo: "元に戻す",
      redo: "やり直す",
      bold: "太字",
      italic: "斜体",
      underline: "下線",
      strike: "取り消し線",
      superscript: "上付き",
      subscript: "下付き",
      foreColor: "文字色",
      backColor: "背景色",
      hr: "区切り線",
      selectAll: "すべて選択",
      removeFormat: "書式をクリア",
      indent: "インデントを増やす",
      outdent: "インデントを減らす",
      justifyLeft: "左揃え",
      justifyCenter: "中央揃え",
      justifyRight: "右揃え",
      orderedList: "番号付きリスト",
      unorderedList: "箇条書き",
      table: "表",
      quote: "引用を追加",
      code: "コードを追加",
      formula: "数式",
      emoji: "絵文字",
      preview: "プレビュー",
      ai: "AI"
    },
    colors: {
      more: "その他の色",
      defaultColor: "標準色",
      clearBackground: "背景色をクリア",
      dialogTitle: "色を選択"
    },
    combobox: {
      font: "フォント",
      size: "サイズ",
      format: "段落"
    },
    menu: {
      uploadLocalImage: "ローカル画像をアップロード",
      uploadRemoteImage: "リモート画像を追加",
      tablePickerTitle: "ドラッグして表サイズを選択",
      aiPanelTitle: "AI / 拡張アクション"
    },
    dialog: {
      previewPane: "プレビュー",
      contentPreview: "内容プレビュー",
      linkTitle: "リンクを追加",
      linkHref: "リンク先",
      linkText: "リンクタイトル",
      videoTitle: "動画を追加",
      videoUrlMode: "動画 URL",
      videoEmbedMode: "埋め込みコード",
      videoUrl: "動画 URL",
      videoName: "動画タイトル",
      videoEmbed: "埋め込みコード / iframe URL",
      remoteImageTitle: "リモート画像を追加",
      remoteImageUrl: "リモート画像 URL",
      formulaTitle: "数式を挿入",
      formulaSource: "LaTeX 数式",
      formulaDisplay: "表示形式",
      formulaInline: "インライン数式",
      formulaBlock: "ブロック数式",
      aiChatTitle: "AI チャット",
      aiChatPrompt: "編集指示",
      colorForeTitle: "文字色",
      colorBackTitle: "背景色"
    },
    common: {
      ok: "確認",
      cancel: "キャンセル",
      close: "閉じる",
      send: "送信"
    },
    placeholder: {
      editor: "内容を入力してください...",
      markdown: "Markdown を入力してください...",
      linkHref: "リンク先を入力してください",
      linkText: "リンクタイトルを入力してください",
      videoUrl: "動画 URL を入力してください",
      videoTitle: "動画タイトルを入力してください",
      videoEmbed: "動画サイトが提供する iframe / embed コード、または iframe URL を入力してください",
      remoteImageUrl: "リモート画像 URL を入力してください",
      formulaSource: "例：\\frac{a+b}{c}",
      aiChatPrompt: "例：この文章をより丁寧にしてください"
    },
    draft: {
      found: "前回ページが正常に閉じられなかった可能性があります。",
      recover: "内容を復元",
      cancel: "キャンセル"
    },
    emoji: {
      default: "標準絵文字",
      cute: "顔文字",
      office: "仕事用"
    },
    tips: {
      markdownOnly: "Markdown モードではテキストを直接編集してください",
      invalidColor: "正しい色の値を入力してください",
      linkRequired: "リンク先を入力してください",
      videoEmbedRequired: "埋め込みコードを入力してください",
      videoUrlRequired: "動画 URL を入力してください",
      remoteImageRequired: "リモート画像 URL を入力してください",
      remoteImageInserted: "リモート画像を挿入しました",
      formulaRequired: "数式を入力してください",
      formulaInserted: "数式を挿入しました",
      formulaFailed: "数式の挿入に失敗しました",
      imageUploading: "画像をアップロード中...",
      imageUploadingCount: "{{count}} 枚の画像をアップロード中...",
      imageUploadFailed: "画像のアップロードに失敗しました",
      imageInsertedCount: "{{count}} 枚の画像を挿入しました",
      wordImporting: "Word をインポート中...",
      wordImportSuccess: "Word のインポートが完了しました",
      wordImportFailed: "Word のインポートに失敗しました",
      extensionFailed: "拡張アクションの実行に失敗しました",
      aiFailed: "AI 操作に失敗しました",
      aiPromptRequired: "編集指示を入力してください",
      aiRequestRequired: "先に ai.request コールバックを設定してください",
      aiGenerating: "AI が生成中です...",
      aiDone: "AI の処理が完了しました",
      aiChatFailed: "AI チャットに失敗しました",
      aiResultRequired: "先にメッセージを送信して結果を取得してください",
      aiApplied: "AI チャット結果を適用しました",
      draftRecovered: "未保存の内容を復元しました"
    },
    insert: {
      quote: "引用内容",
      videoUnsupported: "お使いのブラウザーは video タグに対応していません。"
    }
  };

  Demo.register({
    key: "i18n-ja",
    title: "多语言：日文",
    eyebrow: "仅富文本编辑器使用自定义 ja-JP 语言包",
    render: function () {
      Demo.renderEditorPage({
        key: "i18n-ja",
        title: "多语言：日文",
        eyebrow: "仅富文本编辑器使用自定义 ja-JP 语言包",
        locale: "ja-JP",
        locales: {
          "ja-JP": japaneseLocale
        },
        placeholder: "内容を入力してください...",
        value: "<p>このエディターはカスタム日本語パックを使用しています。</p>"
      });
    }
  });
})(window.JavaexEditorDemo);
