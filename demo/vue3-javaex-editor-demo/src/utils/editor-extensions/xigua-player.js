// 西瓜播放器 H5 网页版扩展示例。
// 这个文件刻意放在 jiantu-vue 业务项目中，而不是放进 javaexEditor：
// 1. javaexEditor 只负责提供通用扩展入口：toolbar 按钮、action 回调、context.insertHtml 等。
// 2. 具体用哪个播放器、加载哪个脚本、插入什么 HTML、弹窗长什么样，都应该由业务项目自己决定。
// 3. 以后换成 DPlayer、ArtPlayer 或公司内部播放器时，只需要替换这个业务扩展文件。
export const XIGUA_PLAYER_SCRIPT = 'https://unpkg.byted-static.com/xgplayer/2.31.2/browser/index.js';

const scriptLoaders = new Map();
const XIGUA_PLAYER_STYLE_ID = 'jiantu-xigua-player-style';

// 工具栏图标由业务扩展自己提供。javaexEditor 不内置“西瓜播放器”的任何资源或概念。
const XIGUA_PLAYER_ICON = `
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.4" stroke="currentColor" stroke-width="1.8"></rect>
    <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="currentColor"></path>
    <path d="M7 19.5h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
</svg>`;

const DEFAULT_PROMPTS = {
    dialogTitle: '插入西瓜播放器',
    urlLabel: '视频地址',
    urlPlaceholder: '请输入视频地址，例如 https://example.com/video.mp4',
    titleLabel: '视频标题',
    titlePlaceholder: '可选',
    posterLabel: '封面图片',
    posterPlaceholder: '可选，填写图片 URL',
    confirmText: '插入',
    cancelText: '取消',
    requiredMessage: '请先输入视频地址'
};

// 这段样式属于业务扩展自身，不属于 javaexEditor 的内置样式。
// 编辑区插入内容前会注入一次；只读页 decorateXiguaPlayers 也会注入一次，保证编辑和展示都稳定。
const XIGUA_PLAYER_STYLE = `
.jiantu-xigua-player {
    margin: 18px 0;
}
.jiantu-xigua-player__mount,
.jiantu-xigua-player__fallback {
    display: block;
    width: 100%;
    min-height: 240px;
    border-radius: 8px;
    background: #111827;
    overflow: hidden;
}
.jiantu-xigua-player__mount {
    display: none;
}
.jiantu-xigua-player.is-initializing .jiantu-xigua-player__mount,
.jiantu-xigua-player.is-ready .jiantu-xigua-player__mount {
    display: block;
}
.jiantu-xigua-player.is-initializing .jiantu-xigua-player__fallback,
.jiantu-xigua-player.is-ready .jiantu-xigua-player__fallback {
    display: none;
}
.jiantu-xigua-player__title {
    margin-top: 8px;
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
}
.jiantu-xigua-player-dialog-mask {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 23, 42, 0.24);
    backdrop-filter: blur(6px);
}
.jiantu-xigua-player-dialog {
    width: min(520px, 100%);
    overflow: hidden;
    border: 1px solid #e7edf5;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 10px 30px rgba(79, 140, 255, 0.10);
    backdrop-filter: blur(12px);
}
.jiantu-xigua-player-dialog__header {
    padding: 12px 18px;
    border-bottom: 1px solid #edf2f7;
    background: linear-gradient(135deg, #fbfdff 0%, #f6faff 100%);
    color: #1f2937;
    font-size: 14px;
    font-weight: 600;
}
.jiantu-xigua-player-dialog__body {
    display: grid;
    gap: 14px;
    padding: 20px 22px 12px;
}
.jiantu-xigua-player-dialog__field {
    display: grid;
    gap: 6px;
}
.jiantu-xigua-player-dialog__field span {
    color: #606266;
    font-size: 12px;
}
.jiantu-xigua-player-dialog__field input {
    width: 100%;
    height: 34px;
    box-sizing: border-box;
    border: 1px solid #e6eefc;
    border-radius: 12px;
    padding: 0 11px;
    color: #1f2a44;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 2px 6px rgba(31, 42, 68, 0.04);
    outline: none;
}
.jiantu-xigua-player-dialog__field input:focus {
    border-color: #4f8cff;
}
.jiantu-xigua-player-dialog__error {
    min-height: 18px;
    color: #f56c6c;
    font-size: 12px;
}
.jiantu-xigua-player-dialog__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 10px 22px 20px;
}
.jiantu-xigua-player-dialog__btn {
    height: 32px;
    min-width: 68px;
    border: 1px solid #d6e5ff;
    border-radius: 10px;
    padding: 0 14px;
    background: #f6faff;
    color: #42526b;
    cursor: pointer;
}
.jiantu-xigua-player-dialog__btn-primary {
    border-color: transparent;
    background: linear-gradient(135deg, #4f8cff 0%, #72a7ff 100%);
    color: #fff;
    box-shadow: 0 8px 18px rgba(79, 140, 255, 0.18);
}`;

// 所有用户输入都会进入 HTML 属性或文本节点，所以这里做最基础的转义。
// 这不是为了替代后端安全过滤，而是避免扩展示例自己拼接 HTML 时破坏结构。
function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// HTML 属性和普通文本的转义规则在这里相同，因此单独留一个语义化函数。
// 后续如果要对白名单 URL、协议等做更严格校验，可以只改这个入口。
function escapeAttribute(value = '') {
    return escapeHtml(value);
}

function mergePrompts(prompts = {}) {
    return {
        ...DEFAULT_PROMPTS,
        ...prompts
    };
}

// 给播放器容器生成一个稳定 id。
// 西瓜播放器 v2 示例支持通过 id 或 el 找到容器并初始化播放器。
function createPlayerId(value = '') {
    const id = String(value || '').trim();
    if (id) {
        return id.replace(/[^\w-]/g, '-');
    }
    return `jiantu-xigua-player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 业务扩展自己的输入弹窗。
// 这里没有依赖 Element Plus，是为了让这个扩展示例可以直接复制到任何 Vue/普通页面里使用。
function openXiguaPlayerDialog(options = {}) {
    if (typeof document === 'undefined') {
        return Promise.resolve(null);
    }

    const prompts = mergePrompts(options.prompts);
    const defaults = options.defaults || {};

    return new Promise((resolve) => {
        const mask = document.createElement('div');
        mask.className = 'jiantu-xigua-player-dialog-mask';
        mask.innerHTML = `
            <div class="jiantu-xigua-player-dialog" role="dialog" aria-modal="true" aria-label="${escapeAttribute(prompts.dialogTitle)}">
                <div class="jiantu-xigua-player-dialog__header">${escapeHtml(prompts.dialogTitle)}</div>
                <div class="jiantu-xigua-player-dialog__body">
                    <label class="jiantu-xigua-player-dialog__field">
                        <span>${escapeHtml(prompts.urlLabel)}</span>
                        <input data-xigua-field="url" value="${escapeAttribute(defaults.url)}" placeholder="${escapeAttribute(prompts.urlPlaceholder)}" />
                    </label>
                    <label class="jiantu-xigua-player-dialog__field">
                        <span>${escapeHtml(prompts.titleLabel)}</span>
                        <input data-xigua-field="title" value="${escapeAttribute(defaults.title)}" placeholder="${escapeAttribute(prompts.titlePlaceholder)}" />
                    </label>
                    <label class="jiantu-xigua-player-dialog__field">
                        <span>${escapeHtml(prompts.posterLabel)}</span>
                        <input data-xigua-field="poster" value="${escapeAttribute(defaults.poster)}" placeholder="${escapeAttribute(prompts.posterPlaceholder)}" />
                    </label>
                    <div class="jiantu-xigua-player-dialog__error" data-xigua-error></div>
                </div>
                <div class="jiantu-xigua-player-dialog__footer">
                    <button type="button" class="jiantu-xigua-player-dialog__btn" data-xigua-cancel>${escapeHtml(prompts.cancelText)}</button>
                    <button type="button" class="jiantu-xigua-player-dialog__btn jiantu-xigua-player-dialog__btn-primary" data-xigua-confirm>${escapeHtml(prompts.confirmText)}</button>
                </div>
            </div>
        `;

        const dialog = mask.querySelector('.jiantu-xigua-player-dialog');
        const urlInput = mask.querySelector('[data-xigua-field="url"]');
        const titleInput = mask.querySelector('[data-xigua-field="title"]');
        const posterInput = mask.querySelector('[data-xigua-field="poster"]');
        const error = mask.querySelector('[data-xigua-error]');

        const close = (value) => {
            document.removeEventListener('keydown', onKeydown);
            mask.remove();
            resolve(value);
        };

        const confirm = () => {
            const url = urlInput.value.trim();
            if (!url) {
                error.textContent = prompts.requiredMessage;
                urlInput.focus();
                return;
            }
            close({
                url,
                title: titleInput.value.trim(),
                poster: posterInput.value.trim()
            });
        };

        const onKeydown = (event) => {
            if (event.key === 'Escape') {
                close(null);
            }
            if (event.key === 'Enter' && dialog.contains(document.activeElement)) {
                confirm();
            }
        };

        mask.addEventListener('click', (event) => {
            if (event.target === mask || event.target.closest('[data-xigua-cancel]')) {
                close(null);
            }
            if (event.target.closest('[data-xigua-confirm]')) {
                confirm();
            }
        });

        document.addEventListener('keydown', onKeydown);
        document.body.appendChild(mask);
        urlInput.focus();
        urlInput.select();
    });
}

// 注入播放器扩展自己的展示样式。
// 放在业务扩展里可以避免 javaexEditor 被某个具体播放器污染。
export function ensureXiguaPlayerStyle() {
    if (typeof document === 'undefined' || document.getElementById(XIGUA_PLAYER_STYLE_ID)) {
        return;
    }
    const style = document.createElement('style');
    style.id = XIGUA_PLAYER_STYLE_ID;
    style.textContent = XIGUA_PLAYER_STYLE;
    document.head.appendChild(style);
}

// 生成插入富文本编辑器的播放器 HTML。
// 外层 data-* 是给只读展示时 decorateXiguaPlayers 再次初始化播放器用的。
// 内层 video 是兜底：即使播放器脚本加载失败，内容仍然可以被浏览器原生播放。
export function buildXiguaPlayerHtml(options = {}) {
    const {
        id,
        url = '',
        poster = '',
        title = '',
        width = '100%',
        height = 360
    } = options;
    const playerId = createPlayerId(id);
    const safeUrl = escapeAttribute(url);
    const safePoster = escapeAttribute(poster);
    const safeTitle = escapeAttribute(title || '西瓜播放器');

    return `
<div class="jiantu-xigua-player" contenteditable="false" data-xigua-player data-player-id="${escapeAttribute(playerId)}" data-video-url="${safeUrl}" data-poster="${safePoster}" data-title="${safeTitle}" data-width="${escapeAttribute(width)}" data-height="${escapeAttribute(height)}">
    <div class="jiantu-xigua-player__mount" id="${escapeAttribute(playerId)}"></div>
    <video class="jiantu-xigua-player__fallback" controls src="${safeUrl}" poster="${safePoster}" title="${safeTitle}"></video>
    ${title ? `<div class="jiantu-xigua-player__title">${escapeHtml(title)}</div>` : ''}
</div>
<p><br /></p>`.trim();
}

// 创建 javaexEditor 的工具栏扩展动作。
// key 必须同时写进 editorOptions.toolbar，编辑器才会在工具栏渲染这个扩展按钮。
// action 拿到的 context 是编辑器提供的通用能力，这里只用 insertHtml/showTip，不依赖编辑器内部实现。
export function createXiguaPlayerExtension(options = {}) {
    const {
        key = 'xigua-player',
        label = '西瓜播放器',
        description = '插入西瓜播放器 H5 网页版',
        placement = 'toolbar',
        iconSvg = XIGUA_PLAYER_ICON,
        url = '',
        poster = '',
        title = '',
        width = '100%',
        height = 360,
        prompts = {},
        input,
        render
    } = options;

    return {
        key,
        label,
        description,
        placement,
        iconSvg,
        async action(context) {
            ensureXiguaPlayerStyle();

            // input 是留给业务替换弹窗的钩子；不传时使用这个示例内置的轻量弹窗。
            // 例如可以在这里改成 Element Plus Dialog、接口选择器或素材库选择器。
            const values = typeof input === 'function'
                ? await input({ url, poster, title, prompts, context })
                : await openXiguaPlayerDialog({
                    prompts,
                    defaults: { url, poster, title }
                });

            if (!values?.url) {
                context.showTip?.('已取消插入西瓜播放器');
                return;
            }

            const playerId = createPlayerId();
            const payload = {
                id: playerId,
                url: values.url,
                poster: values.poster || '',
                title: values.title || '',
                width,
                height,
                context,
                // buildHtml 自动带上本次生成的 playerId。
                // 业务侧即使在 render 里只覆盖 url/poster/title/height，也不会把初始化要用的 id 丢掉。
                buildHtml: (htmlOptions = {}) => buildXiguaPlayerHtml({
                    id: playerId,
                    url: values.url,
                    poster: values.poster || '',
                    title: values.title || '',
                    width,
                    height,
                    ...htmlOptions
                })
            };

            // render 是留给业务自定义“最终插入内容”的出口。
            // 比如可以在播放器外面包一层卡片、加来源信息，或保存自定义 data-* 字段。
            const html = typeof render === 'function'
                ? await render(payload)
                : buildXiguaPlayerHtml(payload);

            context.insertHtml?.(html);

            // insertHtml 只负责把播放器容器插入编辑区。
            // 西瓜播放器真正生效还需要加载脚本并 new Player；这里延迟到 DOM 写入后再初始化刚插入的播放器。
            window.setTimeout(() => {
                decorateXiguaPlayers(document, { targetId: payload.id }).catch((error) => {
                    console.error(error);
                    context.showTip?.('西瓜播放器初始化失败，已保留原生 video 兜底');
                });
            }, 0);
            context.showTip?.('已插入西瓜播放器');
        }
    };
}

// 业务只读页需要播放器能力时，按需加载西瓜播放器脚本。
// 使用 Map 缓存 Promise，可以避免一个页面多个播放器重复插入 script。
export function loadXiguaPlayerScript(src = XIGUA_PLAYER_SCRIPT) {
    if (typeof document === 'undefined' || !src) {
        return Promise.resolve();
    }
    if (scriptLoaders.has(src)) {
        return scriptLoaders.get(src);
    }

    const promise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-xigua-player-script="${escapeAttribute(src)}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.xiguaPlayerScript = src;
        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
    }).catch((error) => {
        scriptLoaders.delete(src);
        throw error;
    });

    scriptLoaders.set(src, promise);
    return promise;
}

// 初始化只读内容中的西瓜播放器。
// 这个函数放在业务项目中调用，例如文档详情页、帖子详情页、预览页。
export async function decorateXiguaPlayers(container, options = {}) {
    if (!container || typeof window === 'undefined') {
        return;
    }

    ensureXiguaPlayerStyle();
    await loadXiguaPlayerScript(options.script || XIGUA_PLAYER_SCRIPT);
    const Player = options.Player || window.Player || window.XGPlayer;
    if (typeof Player !== 'function') {
        return;
    }

    container.querySelectorAll('[data-xigua-player]').forEach((wrapper) => {
        if (wrapper.dataset.xiguaReady === 'true') {
            return;
        }
        if (options.targetId && wrapper.dataset.playerId !== options.targetId) {
            return;
        }

        const mount = wrapper.querySelector('.jiantu-xigua-player__mount');
        const url = wrapper.dataset.videoUrl || '';
        if (!mount || !url) {
            return;
        }

        if (wrapper.dataset.playerId) {
            mount.id = wrapper.dataset.playerId;
        }

        // 初始化前先显示 mount，避免播放器在 display:none 的容器里计算不到尺寸。
        // 如果初始化失败，会回到原生 video 兜底，用户仍然能看到并播放视频。
        wrapper.classList.add('is-initializing');
        try {
            const player = new Player({
                id: mount.id,
                el: mount,
                url,
                poster: wrapper.dataset.poster || '',
                fluid: true,
                width: wrapper.dataset.width || '100%',
                height: Number(wrapper.dataset.height) || 360,
                ...(options.playerOptions || {})
            });

            wrapper.__xiguaPlayer = player;
            wrapper.dataset.xiguaReady = 'true';
            wrapper.classList.remove('is-initializing');
            wrapper.classList.add('is-ready');
        } catch (error) {
            wrapper.classList.remove('is-initializing');
            console.error(error);
        }
    });
}
