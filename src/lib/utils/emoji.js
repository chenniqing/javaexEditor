function normalizeBaseUrl(baseUrl = "/") {
  const value = String(baseUrl || "/");
  return value.endsWith("/") ? value : `${value}/`;
}

function getFileLabel(filename) {
  return String(filename || "")
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[_-]?/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

/**
 * 把“名称|图片地址,名称|图片地址”解析成图片表情项。
 *
 * 这个函数放在编辑器包里，是因为它和具体业务无关：
 * 只要业务方想从环境变量、配置表或接口返回值里拼图片表情，都可以复用它。
 */
export function parseImageEmojiItems(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label, url] = item.includes("|")
        ? item.split("|").map((part) => part.trim())
        : [getFileLabel(item), item];

      return {
        type: "image",
        label: label || url,
        value: url
      };
    })
    .filter((item) => item.value);
}

/**
 * 根据 public 目录下的图片文件名创建图片表情组。
 *
 * 例如 Vite 项目里 public/meme/a.png 可以通过 /meme/a.png 访问，
 * 业务方只需要传 files: ["a.png"] 和 publicPath: "meme"。
 */
export function createPublicImageEmojiGroup(options = {}) {
  const {
    key = "image-emoji",
    label = "图片表情",
    files = [],
    baseUrl = "/",
    publicPath = ""
  } = options;
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const normalizedPublicPath = String(publicPath || "").replace(/^\/+|\/+$/g, "");
  const pathPrefix = normalizedPublicPath ? `${normalizedPublicPath}/` : "";

  return {
    key,
    label,
    items: files.map((filename) => ({
      type: "image",
      label: getFileLabel(filename),
      value: `${normalizedBaseUrl}${pathPrefix}${encodeURIComponent(filename)}`
    }))
  };
}

/**
 * 根据图片表情项创建完整分组。
 *
 * items 可以是 parseImageEmojiItems 的结果，也可以是业务接口直接返回的标准项。
 */
export function createImageEmojiGroup(options = {}) {
  const {
    key = "image-emoji",
    label = "图片表情",
    items = []
  } = options;

  return {
    key,
    label,
    items
  };
}
