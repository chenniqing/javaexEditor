const IMGBB_UPLOAD_URL = "https://imgbb.com/json";
const IMGBB_UPLOAD_FIELDS = {
  type: "file",
  action: "upload",
  timestamp: "1777806301000",
  auth_token: "f115dac7561da8078d60ffb5f943ae8e4f47b1d1"
};

export async function uploadImagesToImgbb(files) {
  return Promise.all(Array.from(files || []).map(uploadImageToImgbb));
}

async function uploadImageToImgbb(file) {
  const formData = new FormData();
  formData.append("source", file, file.name);
  Object.entries(IMGBB_UPLOAD_FIELDS).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(IMGBB_UPLOAD_URL, {
    method: "POST",
    body: formData
  });
  const data = await response.json();
  if (!response.ok || data.status_code !== 200) {
    throw new Error(data?.error?.message || data?.status_txt || "图片上传失败");
  }

  const image = data.image || {};
  const url = image.image?.url || image.display_url || image.url || image.medium?.url || image.thumb?.url;
  if (!url) {
    throw new Error("图片上传成功，但响应中没有图片地址");
  }

  return {
    url,
    alt: file.name,
    title: file.name
  };
}
