(function (Demo) {
  var imageUploadEndpoint = "https://imgbb.com/json";
  var imageUploadConfig = {
    type: "file",
    action: "upload",
    timestamp: "1777806301000",
    auth_token: "f115dac7561da8078d60ffb5f943ae8e4f47b1d1"
  };

  function uploadImagesToImgbb(files) {
    return Promise.all(Array.from(files || []).map(uploadImageToImgbb));
  }

  function uploadImageToImgbb(file) {
    var formData = new FormData();
    formData.append("source", file, file.name);
    formData.append("type", imageUploadConfig.type);
    formData.append("action", imageUploadConfig.action);
    formData.append("timestamp", imageUploadConfig.timestamp);
    formData.append("auth_token", imageUploadConfig.auth_token);

    return new Promise(function (resolve, reject) {
      $.ajax({
        url: imageUploadEndpoint,
        method: "POST",
        data: formData,
        processData: false,
        contentType: false
      })
        .done(function (response) {
          var image = response?.image || {};
          var url = image.image?.url || image.display_url || image.url || image.medium?.url || image.thumb?.url;
          if (!url) {
            reject(new Error("图片上传成功，但响应中没有图片地址"));
            return;
          }
          resolve({
            url: url,
            alt: file.name,
            title: file.name
          });
        })
        .fail(function (xhr) {
          var message = xhr.responseJSON?.error?.message || xhr.responseJSON?.status_txt || xhr.statusText || "图片上传失败";
          reject(new Error(message));
        });
    });
  }

  Demo.register({
    key: "upload-image",
    title: "上传图片示例",
    eyebrow: "通过 imgbb 接口上传并插入远程图片地址",
    render: function () {
      Demo.renderEditorPage({
        key: "upload-image",
        title: "上传图片示例",
        eyebrow: "通过 imgbb 接口上传并插入远程图片地址",
        toolbar: ["image", "preview", "fullscreen"],
        imageUploader: uploadImagesToImgbb,
        value: "<p>点击图片按钮选择本地图片，示例会通过 imgbb 接口上传后插入远程图片。</p>"
      });
    }
  });
})(window.JavaexEditorDemo);
