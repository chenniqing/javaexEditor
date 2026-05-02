import mammoth from "mammoth";

export async function importWordFile(file) {
  const name = String(file?.name || "").toLowerCase();
  if (!name.endsWith(".docx")) {
    throw new Error("仅支持导入 .docx 格式的 Word 文件");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      includeDefaultStyleMap: true,
      convertImage: mammoth.images.inline(async (image) => ({
        src: `data:${image.contentType};base64,${await image.readAsBase64String()}`
      }))
    }
  );

  return {
    html: result.value || "",
    messages: result.messages || []
  };
}
