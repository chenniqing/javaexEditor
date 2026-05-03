const STYLE_ID = "javaex-editor-runtime-style";

export const editorStyleText = `
/* 编辑器根容器 */
.javaex-editor-editor {
  --javaex-editor-menu-z-index: 3100;
  --javaex-editor-dialog-z-index: 3200;
  --javaex-editor-upload-z-index: 3300;
  --javaex-editor-tip-z-index: 3400;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  line-height: 1.7;
  border: 1px solid var(--javaex-border-panel, #e7edf5);
  border-radius: var(--javaex-radius-lg, 18px);
  background: var(--javaex-bg-white-soft-2, rgba(255, 255, 255, 0.96));
  color: var(--javaex-text-primary, #1f2a44);
  font-family: var(--javaex-font-family-base, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif);
  backdrop-filter: var(--javaex-backdrop-blur, blur(12px));
  overflow: visible;
}

.javaex-editor-editor *,
.javaex-editor-editor *::before,
.javaex-editor-editor *::after {
  box-sizing: border-box;
}

.javaex-editor-editor.is-disabled {
  opacity: 0.72;
}

/* 顶部工具栏 */
.javaex-editor-toolbar {
  position: relative;
  border-bottom: 1px solid var(--javaex-border-section, #edf2f7);
  background: linear-gradient(135deg, var(--javaex-bg-surface-top, #fbfdff) 0%, var(--javaex-bg-button-soft, #f6faff) 100%);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.javaex-editor-toolbar.is-sticky {
  position: sticky;
  top: var(--javaex-editor-toolbar-sticky-top, 0px);
  z-index: 20;
}

.javaex-editor-toolbar-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2px 0;
  padding: 8px;
}

.javaex-editor-mode-switch {
  display: inline-flex;
  margin-left: auto;
  align-self: center;
  padding: 1px;
  border: 1px solid var(--javaex-border-toggle, #e5ebf3);
  border-radius: 999px;
  background: var(--javaex-bg-surface-soft, #f8fbff);
  box-shadow: var(--javaex-shadow-xs, 0 2px 6px rgba(31, 42, 68, 0.04));
  overflow: hidden;
}

.javaex-editor-mode-switch button {
  min-width: 48px;
  height: 20px;
  padding: 0 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--javaex-text-nav, #42526b);
  font-size: 11px;
  font-weight: 600;
  line-height: 20px;
  cursor: pointer;
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}

.javaex-editor-mode-switch button + button {
  margin-left: 2px;
}

.javaex-editor-mode-switch button.active {
  background: var(--javaex-bg-white-plain, #fff);
  color: var(--javaex-brand-strong, #1677ff);
  box-shadow: 0 6px 14px rgba(79, 140, 255, 0.16);
}

.javaex-editor-mode-switch button:hover:not(.active) {
  color: var(--javaex-text-primary, #1f2a44);
  background: rgba(255, 255, 255, 0.78);
}

.javaex-editor-combobox {
  position: relative;
  flex: 0 0 auto;
  width: 90px;
  height: 36px;
  margin-right: 2px;
  border: 1px solid transparent;
  border-radius: var(--javaex-radius-sm, 10px);
  transition: background-color .2s ease, border-color .2s ease, box-shadow .2s ease, color .2s ease;
}

.javaex-editor-combobox:hover,
.javaex-editor-tool:hover:not(:disabled) {
  border-color: var(--javaex-border-accent-hover, #d7e8ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
  box-shadow: none;
}

.javaex-editor-combobox.is-active,
.javaex-editor-tool.is-active {
  border-color: var(--javaex-border-accent-active, #bcd8ff);
  background: #eaf2ff;
  box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.08);
}

.javaex-editor-combobox-size {
  width: 60px;
}

.javaex-editor-combobox-label {
  position: relative;
  width: 100%;
  height: 36px;
  padding: 0 22px 0 10px;
  border: 0;
  background: transparent;
  color: var(--javaex-text-nav, #42526b);
  text-align: left;
  cursor: pointer;
  font-size: 13px;
}

.javaex-editor-combobox-label i {
  font-style: normal;
}

.javaex-editor-tool {
  position: relative;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  border-radius: var(--javaex-radius-sm, 10px);
  color: #6f7f9c;
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease;
}

.javaex-editor-tool-text {
  width: auto;
  min-width: 56px;
  padding: 0 10px;
}

.javaex-editor-tool-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
}

.javaex-editor-tool .icon,
.javaex-editor-combobox-label .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  line-height: 1;
  color: inherit;
  pointer-events: none;
}

.javaex-editor-tool[data-tool="image"] .icon,
.javaex-editor-tool[data-tool="video"] .icon {
  width: 26px;
  min-width: 26px;
  height: 26px;
}

.javaex-editor-tool[data-tool="bold"] .icon,
.javaex-editor-tool[data-tool="italic"] .icon,
.javaex-editor-tool[data-tool="strike"] .icon,
.javaex-editor-tool[data-tool="superscript"] .icon,
.javaex-editor-tool[data-tool="subscript"] .icon {
  width: 30px;
  min-width: 30px;
  height: 30px;
}

.javaex-editor-tool[data-tool="underline"] .icon {
  width: 24px;
  min-width: 24px;
  height: 24px;
}

.javaex-editor-tool[data-tool="preview"] .icon,
.javaex-editor-tool[data-tool="foreColor"] .icon,
.javaex-editor-tool[data-tool="backColor"] .icon,
.javaex-editor-tool[data-tool="orderedList"] .icon,
.javaex-editor-tool[data-tool="unorderedList"] .icon,
.javaex-editor-tool[data-tool="ai"] .icon,
.javaex-editor-tool[data-tool="formula"] .icon,
.javaex-editor-tool[data-tool="importWord"] .icon,
.javaex-editor-tool[data-tool="fullscreen"] .icon {
  width: 24px;
  min-width: 24px;
  height: 24px;
}

.javaex-editor-tool[data-tool="orderedList"] .icon,
.javaex-editor-tool[data-tool="unorderedList"] .icon,
.javaex-editor-tool[data-tool="quote"] .icon,
.javaex-editor-tool[data-tool="code"] .icon {
  width: 26px;
  min-width: 26px;
  height: 26px;
}

.javaex-editor-tool[data-tool="fullscreen"] .icon {
  width: 20px;
  min-width: 20px;
  height: 20px;
}

.javaex-editor-tool .icon svg,
.javaex-editor-combobox-label .icon svg,
.javaex-editor-context-arrow svg {
  display: block;
  width: 100%;
  height: 100%;
}

.javaex-editor-caret {
  position: absolute;
  top: 50%;
  right: 6px;
  width: 8px;
  min-width: 8px;
  transform: translateY(-50%);
  color: #8a9bb8;
}

.javaex-editor-separator {
  display: block;
  flex: 0 0 auto;
  width: 1px;
  height: 26px;
  margin: 5px;
  background: var(--javaex-border-section, #edf2f7);
}

[tooltip] {
  position: relative;
}

[tooltip]::before,
[tooltip]::after {
  pointer-events: none;
}

[tooltip]::before {
  width: 0;
  height: 0;
  border: 5px solid transparent;
  content: "";
  opacity: 0;
  transition: all .3s ease;
}

[tooltip][tooltip-pos="down"]::before,
[tooltip][tooltip-pos="down"]::after {
  position: absolute;
  top: 100%;
  left: 50%;
  z-index: 40;
  opacity: 0;
}

[tooltip][tooltip-pos="down"]::before {
  margin-top: -1px;
  margin-left: -5px;
  border-bottom-color: rgba(61, 61, 61, 0.95);
}

[tooltip][tooltip-pos="down"]::after {
  margin-top: 9px;
  transform: translateX(-50%);
  padding: 8px 10px;
  border-radius: 2px;
  background: rgba(61, 61, 61, 0.95);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  content: attr(tooltip);
  transition: all .3s ease;
}

[tooltip][tooltip-pos="down"]:hover::before,
[tooltip][tooltip-pos="down"]:hover::after {
  opacity: 1;
}

.javaex-editor-menu,
.javaex-editor-context-menu {
  position: absolute;
  top: -9999px;
  left: -9999px;
  z-index: var(--javaex-editor-menu-z-index, 3100);
  display: none;
}

.javaex-editor-menu.is-open,
.javaex-editor-context-menu.is-open {
  display: block;
}

.javaex-editor-menu-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.javaex-editor-combobox-menu {
  min-width: 124px;
  padding: 6px;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-md, 12px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
}

.javaex-editor-combobox-menu[data-menu-panel="format"] {
  min-width: 100px;
  padding: 4px;
}

.javaex-editor-combobox-item {
  display: block;
  color: var(--javaex-text-primary, #1f2a44);
  cursor: pointer;
  border-radius: var(--javaex-radius-sm, 10px);
  transition: background-color .2s ease, color .2s ease;
}

.javaex-editor-combobox-item:hover,
.javaex-editor-combobox-item.is-checked {
  color: var(--javaex-brand-strong, #1677ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
}

.javaex-editor-combobox-item-label {
  display: inline-block;
  width: 100%;
  padding: 3px 8px;
  font-size: 12px;
  line-height: 1.3;
}

.javaex-editor-combobox-menu[data-menu-panel="format"] .javaex-editor-combobox-item-label {
  padding: 1px 7px;
  font-size: 12px;
  line-height: 1.2;
}

.javaex-editor-image-menu,
.javaex-editor-context-menu {
  min-width: 148px;
  padding: 6px 0;
}

.javaex-editor-image-menu {
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-md, 12px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
}

.javaex-editor-image-menu button,
.javaex-editor-context-menu button {
  display: block;
  width: 100%;
  height: 34px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  border-radius: var(--javaex-radius-sm, 10px);
  color: var(--javaex-text-primary, #1f2a44);
  text-align: left;
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease;
}

.javaex-editor-image-menu button:hover,
.javaex-editor-context-menu button:hover {
  color: var(--javaex-brand-strong, #1677ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
}

.javaex-editor-context-menu button:disabled {
  color: #b6c2d5;
  background: transparent;
  cursor: not-allowed;
}

.javaex-editor-context-menu button:disabled small {
  color: #c8d2e2;
}

.javaex-editor-context-menu button {
  color: #495060;
}

.javaex-editor-context-menu button:hover {
  background: #f4faff;
}

.javaex-editor-table-context-menu,
.javaex-editor-context-submenu-panel {
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-md, 12px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
}

.javaex-editor-table-context-menu {
  min-width: 188px;
  padding: 6px 0;
}

.javaex-editor-context-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 34px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--javaex-text-primary, #1f2a44);
  text-align: left;
  cursor: pointer;
}

.javaex-editor-context-menu .javaex-editor-context-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.javaex-editor-context-item.is-active {
  color: var(--javaex-brand-strong, #1677ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
}

.javaex-editor-context-item.is-active small {
  color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-context-item > span {
  flex: 1 1 auto;
  min-width: 0;
}

.javaex-editor-context-item small {
  flex: 0 0 auto;
  margin-left: 16px;
  color: var(--javaex-text-description, #8a94a6);
  font-size: 12px;
  text-align: right;
}

.javaex-editor-context-arrow {
  display: inline-flex;
  width: 12px;
  height: 12px;
}

.javaex-editor-context-item:hover small,
.javaex-editor-context-submenu:hover > .javaex-editor-context-item small {
  color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-context-divider {
  height: 1px;
  margin: 6px 0;
  background: var(--javaex-border-section, #edf2f7);
}

.javaex-editor-context-submenu {
  position: relative;
}

.javaex-editor-context-submenu-panel {
  position: absolute;
  top: 0;
  left: calc(100% - 2px);
  min-width: 250px;
  padding: 6px 0;
}

.javaex-editor-context-submenu:hover > .javaex-editor-context-submenu-panel {
  display: block;
}

.javaex-editor-color-menu {
  width: 200px;
  padding: 12px;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-md, 12px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
}

.javaex-editor-color-menu.is-open {
  display: block;
}

.javaex-editor-color-grid {
  display: grid;
  grid-template-columns: repeat(6, 22px);
  gap: 8px;
}

.javaex-editor-color-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.javaex-editor-color-action {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: var(--javaex-radius-sm, 10px);
  background: var(--javaex-bg-button-soft, #f6faff);
  color: var(--javaex-text-nav, #42526b);
  font-size: 12px;
  cursor: pointer;
  transition: border-color .2s ease, background-color .2s ease, color .2s ease;
}

.javaex-editor-color-action-reset {
  flex: 1 1 auto;
  justify-content: flex-start;
}

.javaex-editor-color-action-more {
  flex: 0 0 auto;
  width: 30px;
  min-width: 30px;
  padding: 0;
  justify-content: center;
  margin-left: auto;
}

.javaex-editor-color-action:hover {
  color: var(--javaex-brand-strong, #1677ff);
  border-color: var(--javaex-border-accent-hover, #d7e8ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
}

.javaex-editor-color-action-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}

.javaex-editor-color-action-icon svg {
  width: 100%;
  height: 100%;
}

.javaex-editor-color-action-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #bcd8ff;
  background: linear-gradient(135deg, #ff6262 0%, #ffdb58 25%, #48d597 52%, #4f8cff 76%, #9b6bff 100%);
}

.javaex-editor-color-divider {
  height: 1px;
  margin: 10px 0 8px;
  background: var(--javaex-border-section, #edf2f7);
}

.javaex-editor-color-dot {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: transform .15s ease;
}

.javaex-editor-color-dot:hover {
  transform: scale(1.15);
}

/* 各类下拉面板与扩展面板 */
.javaex-editor-panel {
  padding: 12px;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-md, 12px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
  backdrop-filter: var(--javaex-backdrop-blur, blur(12px));
}

.javaex-editor-panel-emoji {
  width: min(520px, calc(100vw - 40px));
}

.javaex-editor-panel-table {
  width: 214px;
}

.javaex-editor-panel-ai {
  width: min(320px, calc(100vw - 40px));
}

.javaex-editor-panel-title {
  margin-bottom: 10px;
  color: var(--javaex-text-secondary, #606266);
  font-size: 13px;
}

.javaex-editor-panel-tabs,
.javaex-editor-preview-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.javaex-editor-panel-tabs {
  margin-bottom: 12px;
}

.javaex-editor-panel-tabs button,
.javaex-editor-preview-tabs button,
.javaex-editor-dialog-close,
.javaex-editor-dialog-btn,
.javaex-editor-action,
.javaex-editor-emoji {
  font-family: inherit;
}

.javaex-editor-panel-tabs button,
.javaex-editor-preview-tabs button {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-sm, 10px);
  background: var(--javaex-bg-white-plain, #fff);
  color: var(--javaex-text-nav, #42526b);
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease;
}

.javaex-editor-panel-tabs button.active,
.javaex-editor-preview-tabs button.active {
  color: var(--javaex-brand-strong, #1677ff);
  border-color: var(--javaex-border-accent-active, #bcd8ff);
  background: var(--javaex-bg-surface-active, #f7fbff);
  box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.06);
}

.javaex-editor-emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 6px;
  max-height: 248px;
  overflow-y: auto;
  padding-right: 4px;
}

.javaex-editor-emoji-grid[data-emoji-group="cute"] {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.javaex-editor-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 6px 8px;
  border: 1px solid var(--javaex-border-color-light, #eef3fc);
  border-radius: var(--javaex-radius-sm, 10px);
  background: var(--javaex-bg-white-plain, #fff);
  color: var(--javaex-text-primary, #1f2a44);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease, color .15s ease;
}

.javaex-editor-emoji:hover {
  border-color: var(--javaex-border-accent-hover, #d7e8ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
  color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-emoji-image {
  min-height: 74px;
  padding: 6px;
}

.javaex-editor-emoji-image img {
  display: block;
  max-width: 100%;
  max-height: 68px;
  object-fit: contain;
  pointer-events: none;
}

.javaex-editor-emoji-grid[data-emoji-group="cute"] .javaex-editor-emoji {
  justify-content: center;
  min-height: 40px;
  padding: 6px 6px;
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
}

.javaex-editor-table-picker {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
}

.javaex-editor-table-picker-cell {
  min-height: 16px;
  aspect-ratio: 1;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: 4px;
  background: var(--javaex-bg-white-plain, #fff);
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease, box-shadow .2s ease;
}

.javaex-editor-table-picker-cell.active {
  border-color: var(--javaex-border-accent-active, #bcd8ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
  box-shadow: inset 0 0 0 1px rgba(79, 140, 255, 0.08);
}

.javaex-editor-panel-foot {
  margin-top: 10px;
  color: var(--javaex-text-description, #8a94a6);
  font-size: 13px;
}

.javaex-editor-action {
  display: grid;
  gap: 2px;
  width: 100%;
  min-height: 46px;
  margin-top: 8px;
  padding: 7px 10px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: var(--javaex-radius-sm, 10px);
  background: var(--javaex-bg-button-soft, #f6faff);
  color: var(--javaex-text-nav, #42526b);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color .2s ease, background-color .2s ease, color .2s ease;
}

.javaex-editor-action:hover {
  color: var(--javaex-brand-strong, #1677ff);
  border-color: var(--javaex-border-accent-hover, #d7e8ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
}

.javaex-editor-action span {
  min-width: 0;
  line-height: 16px;
}

.javaex-editor-action small {
  min-width: 0;
  overflow: hidden;
  color: var(--javaex-text-description, #8a94a6);
  font-size: 12px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 编辑区与分栏预览区 */
.javaex-editor-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  background: transparent;
  flex: 1 1 auto;
  min-height: 0;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  overflow: hidden;
}

.javaex-editor-editor.has-split-preview .javaex-editor-body {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
}

.javaex-editor-preview-pane {
  display: none;
  flex-direction: column;
  min-height: 100%;
  border-left: 1px solid var(--javaex-border-section, #edf2f7);
  background: linear-gradient(180deg, var(--javaex-bg-surface-top, #fbfdff) 0%, var(--javaex-bg-white-plain, #fff) 100%);
  border-bottom-right-radius: inherit;
}

.javaex-editor-preview-pane.is-active {
  display: flex;
}

.javaex-editor-body-inner {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--javaex-bg-white-plain, #fff);
  border-bottom-left-radius: inherit;
}

.javaex-editor-body-container {
  position: relative;
  display: block;
  flex: 1 1 auto;
  min-height: 320px;
  padding: 14px 16px;
  overflow-y: auto;
  border: 0;
  outline: none;
  word-wrap: break-word;
  line-height: 1.7;
  font-size: 16px;
  color: var(--javaex-text-primary, #1f2a44);
  background: var(--javaex-bg-white-plain, #fff);
}

.javaex-editor-markdown-editor {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-height: 320px;
  padding: 14px 16px;
  border: 0;
  outline: none;
  color: var(--javaex-text-primary, #1f2a44);
  font-size: 14px;
  line-height: 1.8;
  resize: none;
  overflow-y: auto;
  font-family: Consolas, "Courier New", monospace;
  background: var(--javaex-bg-white-plain, #fff);
}

.javaex-editor-body-container[hidden],
.javaex-editor-markdown-editor[hidden] {
  display: none !important;
}

.javaex-editor-editor.is-markdown-mode .javaex-editor-toolbar .javaex-editor-combobox,
.javaex-editor-editor.is-markdown-mode .javaex-editor-tool:not([data-tool="preview"]):not([data-tool="ai"]):not([data-tool="importWord"]):not([data-tool="fullscreen"]) {
  opacity: 0.5;
}

.javaex-editor-editor.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 90;
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
}

.javaex-editor-editor:fullscreen {
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
}

.javaex-editor-editor:fullscreen::backdrop {
  background: rgba(15, 23, 42, 0.72);
}

body.javaex-editor-body-fullscreen {
  overflow: hidden;
}

.javaex-editor-editor.is-fullscreen .javaex-editor-body,
.javaex-editor-editor:fullscreen .javaex-editor-body {
  flex: 1 1 auto;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) !important;
}

.javaex-editor-editor.is-fullscreen .javaex-editor-body-inner,
.javaex-editor-editor:fullscreen .javaex-editor-body-inner {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.javaex-editor-editor.is-fullscreen .javaex-editor-preview-pane,
.javaex-editor-editor:fullscreen .javaex-editor-preview-pane {
  display: none !important;
}

.javaex-editor-editor.is-fullscreen .javaex-editor-body-container,
.javaex-editor-editor:fullscreen .javaex-editor-body-container,
.javaex-editor-editor.is-fullscreen .javaex-editor-markdown-editor,
.javaex-editor-editor:fullscreen .javaex-editor-markdown-editor {
  flex: 1 1 auto;
  min-height: 0 !important;
  height: 100%;
  max-height: none !important;
}

.javaex-editor-body-container.is-empty::before {
  content: attr(data-placeholder);
  position: absolute;
  top: 14px;
  left: 16px;
  right: 16px;
  color: var(--javaex-text-placeholder, #9caecc);
  line-height: 1.7;
  pointer-events: none;
}

.javaex-editor-body-container.is-empty:focus::before {
  content: "";
}

.javaex-editor-hidden-input {
  display: none;
}

.javaex-editor-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: var(--javaex-editor-dialog-z-index, 3200);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.24);
  backdrop-filter: blur(6px);
}

.javaex-editor-dialog-mask.is-open {
  display: flex;
}

.javaex-editor-dialog {
  width: min(460px, 100%);
  border: 1px solid var(--javaex-border-panel, #e7edf5);
  border-radius: var(--javaex-radius-lg, 18px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
  backdrop-filter: var(--javaex-backdrop-blur, blur(12px));
  overflow: hidden;
}

.javaex-editor-dialog-preview {
  width: min(1320px, calc(100vw - 40px));
  height: min(92vh, calc(100vh - 32px));
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
}

.javaex-editor-dialog-ai-chat {
  width: min(500px, 100%);
}

.javaex-editor-dialog-color-picker {
  width: min(640px, calc(100vw - 48px));
}

/* 各类弹窗表单 */
.javaex-editor-dialog-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--javaex-border-section, #edf2f7);
  background: linear-gradient(135deg, var(--javaex-bg-surface-top, #fbfdff) 0%, var(--javaex-bg-button-soft, #f6faff) 100%);
}

.javaex-editor-dialog-title {
  color: var(--javaex-text-heading, #1f2937);
  font-size: 14px;
  font-weight: 600;
}

.javaex-editor-dialog-close {
  width: 22px;
  min-width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--javaex-text-nav, #42526b);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: color .2s ease;
}

.javaex-editor-dialog-close:hover {
  color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-dialog-content {
  padding: 20px 22px 12px;
}

.javaex-editor-form-row + .javaex-editor-form-row {
  margin-top: 14px;
}

.javaex-editor-form-label {
  display: block;
  margin-bottom: 7px;
  color: var(--javaex-text-secondary, #606266);
  font-size: 12px;
}

.javaex-editor-form-input {
  width: 100%;
  height: 34px;
  padding: 0 11px;
  border: 1px solid var(--javaex-control-border-color, #e6eefc);
  border-radius: var(--javaex-radius-md, 12px);
  outline: none;
  font-size: 12px;
  color: var(--javaex-text-primary, #1f2a44);
  background: var(--javaex-control-bg, rgba(255, 255, 255, 0.92));
  box-shadow: var(--javaex-shadow-xs, 0 2px 6px rgba(31, 42, 68, 0.04));
  transition: border-color .2s ease, background-color .2s ease, box-shadow .2s ease;
}

.javaex-editor-form-input:focus,
.javaex-editor-form-textarea:focus,
.javaex-editor-form-select:focus {
  border-color: var(--javaex-control-border-color-focus, #4f8cff);
  box-shadow: var(--javaex-control-shadow-focus, none);
}

.javaex-editor-form-textarea {
  min-height: 104px;
  padding: 10px 11px;
  resize: vertical;
  line-height: 1.6;
}

.javaex-editor-form-select {
  cursor: pointer;
}

.javaex-editor-form-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.javaex-editor-form-radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--javaex-text-nav, #42526b);
  font-size: 13px;
  cursor: pointer;
  transition: color .2s ease;
}

.javaex-editor-form-radio input {
  margin: 0;
  accent-color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-form-radio:has(input:checked) {
  color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-form-mode-switch {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 16px;
}

.javaex-editor-form-mode-switch button {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: 999px;
  background: var(--javaex-bg-button-soft, #f6faff);
  color: var(--javaex-text-nav, #42526b);
  font-size: 12px;
  cursor: pointer;
}

.javaex-editor-form-mode-switch button.active {
  color: var(--javaex-brand-strong, #1677ff);
  border-color: var(--javaex-border-accent-active, #bcd8ff);
  background: var(--javaex-bg-surface-active, #f7fbff);
}

.javaex-editor-color-dialog {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 210px;
  gap: 18px;
  align-items: start;
}

.javaex-editor-color-dialog-board-wrap {
  min-width: 0;
}

.javaex-editor-color-dialog-board {
  --javaex-editor-picker-hue: #1677ff;
  position: relative;
  width: 100%;
  height: 250px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: 12px;
  background:
    linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%),
    linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%),
    var(--javaex-editor-picker-hue);
  cursor: pointer;
  overflow: hidden;
}

.javaex-editor-color-dialog-board-cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(31, 42, 68, 0.22);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.javaex-editor-color-dialog-side {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.javaex-editor-color-dialog-hue {
  position: relative;
  width: 16px;
  height: 250px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: 10px;
  background: linear-gradient(
    to bottom,
    #ff0000 0%,
    #ffff00 16.66%,
    #00ff00 33.33%,
    #00ffff 50%,
    #0000ff 66.66%,
    #ff00ff 83.33%,
    #ff0000 100%
  );
  cursor: pointer;
}

.javaex-editor-color-dialog-hue-thumb {
  position: absolute;
  left: -2px;
  right: -2px;
  height: 6px;
  border: 1px solid rgba(31, 42, 68, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.16);
  transform: translateY(-50%);
  pointer-events: none;
}

.javaex-editor-color-dialog-fields {
  display: grid;
  gap: 8px;
}

.javaex-editor-color-dialog-field {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 8px;
  align-items: center;
}

.javaex-editor-color-dialog-field > span {
  color: var(--javaex-text-primary, #1f2a44);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.javaex-editor-color-dialog-field .javaex-editor-form-input {
  height: 32px;
}

.javaex-editor-color-dialog-field-hex > span {
  font-weight: 700;
}

.javaex-editor-color-dialog-preview {
  height: 44px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: 12px;
  background: #1677ff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.javaex-editor-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 22px 20px;
}

.javaex-editor-dialog-btn {
  min-width: 68px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: var(--javaex-radius-sm, 10px);
  background: var(--javaex-bg-button-soft, #f6faff);
  color: var(--javaex-text-nav, #42526b);
  font-size: 12px;
  cursor: pointer;
  transition: background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease, transform .2s ease;
}

.javaex-editor-dialog-btn:hover {
  color: var(--javaex-brand-strong, #1677ff);
  border-color: var(--javaex-border-accent-hover, #d7e8ff);
  background: var(--javaex-bg-accent-hover, #eff6ff);
}

.javaex-editor-dialog-btn-primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--javaex-color-primary, #4f8cff) 0%, var(--javaex-color-primary-hover, #72a7ff) 100%);
  color: var(--javaex-text-white, #fff);
  box-shadow: var(--javaex-shadow-primary, 0 8px 18px rgba(79, 140, 255, 0.18));
}

.javaex-editor-dialog-btn-primary:hover {
  color: var(--javaex-text-white, #fff);
  border-color: transparent;
  background: linear-gradient(135deg, var(--javaex-color-primary, #4f8cff) 0%, var(--javaex-color-primary-hover, #72a7ff) 100%);
  box-shadow: var(--javaex-shadow-primary-hover, 0 12px 22px rgba(79, 140, 255, 0.28));
  transform: translateY(-1px);
}

.javaex-editor-dialog-btn-send {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.javaex-editor-dialog-btn-send .icon {
  display: inline-flex;
  width: 14px;
  height: 14px;
}

.javaex-editor-dialog-btn-send .icon svg {
  width: 100%;
  height: 100%;
}

/* 预览区与公式输出 */
.javaex-editor-preview-body {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 14px 16px;
  overflow: auto;
  line-height: 1.8;
  background: var(--javaex-bg-white-plain, #fff);
}

.javaex-editor-preview-html {
  word-break: break-word;
}

/* 数学公式在编辑区中的展示 */
.javaex-editor-formula {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 4px 10px;
  border: 1px solid var(--javaex-border-color-soft, #d6e5ff);
  border-radius: var(--javaex-radius-sm, 10px);
  color: var(--javaex-text-nav, #42526b);
  background: var(--javaex-bg-button-soft, #f6faff);
  vertical-align: middle;
}

.javaex-editor-formula-block {
  display: inline-flex;
  margin: 4px 0;
}

.javaex-editor-formula-code {
  overflow-wrap: anywhere;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
}

.javaex-editor-formula-anchor {
  display: inline-block;
  width: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  line-height: 0;
}

.javaex-editor-remote-image-anchor {
  display: inline-block;
  width: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  line-height: 0;
}

.javaex-editor-upload-mask {
  position: fixed;
  inset: 0;
  z-index: var(--javaex-editor-upload-z-index, 3300);
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(244, 248, 255, 0.78);
  backdrop-filter: blur(6px);
}

.javaex-editor-upload-mask.is-open {
  display: flex;
}

.javaex-editor-upload-panel {
  min-width: 180px;
  padding: 18px 22px;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: var(--javaex-radius-lg, 18px);
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  color: var(--javaex-text-primary, #1f2a44);
  text-align: center;
  box-shadow: var(--javaex-shadow-md, 0 10px 30px rgba(79, 140, 255, 0.10));
}

.javaex-editor-upload-spinner {
  width: 28px;
  height: 28px;
  margin: 0 auto 12px;
  border: 3px solid rgba(79, 140, 255, 0.18);
  border-top-color: var(--javaex-brand-normal, #409eff);
  border-radius: 50%;
  animation: javaex-spin 0.8s linear infinite;
}

/* 编辑器正文默认排版 */
.javaex-editor-body-container p,
.javaex-editor-preview-html p {
  margin: 0 0 12px;
  font-size: 16px;
}

.javaex-editor-body-container ul,
.javaex-editor-body-container ol,
.javaex-editor-preview-html ul,
.javaex-editor-preview-html ol {
  padding-left: 40px;
}

.javaex-editor-body-container a,
.javaex-editor-preview-html a {
  color: var(--javaex-text-link, #108cee);
  text-decoration: underline;
}

.javaex-editor-body-container img,
.javaex-editor-preview-html img,
.javaex-editor-body-container video,
.javaex-editor-preview-html video,
.javaex-editor-body-container iframe,
.javaex-editor-preview-html iframe {
  max-width: 100%;
  margin: 5px 0;
}

.javaex-editor-edit-image,
.javaex-editor-edit-video {
  margin: 8px 0;
}

.javaex-editor-body-container .javaex-editor-edit-image img,
.javaex-editor-preview-html .javaex-editor-edit-image img {
  max-width: 60%;
}

.javaex-editor-edit-embed iframe,
.javaex-editor-edit-embed embed {
  width: min(100%, 720px);
  min-height: 360px;
  border: 0;
}

.javaex-editor-body-container blockquote,
.javaex-editor-preview-html blockquote {
  display: block;
  margin: 0 0 24px;
  padding: 16px;
  color: var(--javaex-text-secondary, #606266);
  font-size: 16px;
  background: var(--javaex-bg-surface-soft, #f8fbff);
  border-left: 6px solid var(--javaex-color-primary, #4f8cff);
  border-radius: 0 var(--javaex-radius-md, 12px) var(--javaex-radius-md, 12px) 0;
}

.javaex-editor-body-container pre,
.javaex-editor-preview-html pre {
  color: #525252;
  background: #ecf4fa;
  position: relative;
  padding: 10px 12px;
  overflow: auto;
  line-height: 24px;
  border-radius: 3px;
  white-space: pre-wrap;
}

.javaex-editor-body-container code,
.javaex-editor-preview-html code {
  display: inline-block;
  margin: 0 3px;
  padding: 1px 5px;
  border: 1px solid #eee;
  border-radius: 3px;
  color: #666;
  background: #f7f7f7;
  font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
}

.javaex-editor-body-container pre code,
.javaex-editor-preview-html pre code {
  display: block;
  margin: 0;
  padding: 0;
  border: none;
  color: inherit;
  background: transparent;
  white-space: inherit;
}

.javaex-editor-body-container img.javaex-editor-meme-emoji,
.javaex-editor-preview-html img.javaex-editor-meme-emoji {
  display: inline-block;
  width: auto;
  max-width: 160px;
  max-height: 160px;
  vertical-align: middle;
}

.javaex-editor-body-container .hljs,
.javaex-editor-preview-html .hljs {
  display: block;
  overflow-x: auto;
  color: #525252;
  font-size: 14px;
  -webkit-text-size-adjust: none;
}

.javaex-editor-body-container .hljs-doctype,
.javaex-editor-preview-html .hljs-doctype {
  color: #999;
}

.javaex-editor-body-container .hljs-tag,
.javaex-editor-preview-html .hljs-tag {
  color: #3e76f6;
}

.javaex-editor-body-container .hljs-attribute,
.javaex-editor-body-container .hljs-keyword,
.javaex-editor-preview-html .hljs-attribute,
.javaex-editor-preview-html .hljs-keyword,
.javaex-editor-body-container .css .hljs-class,
.javaex-editor-preview-html .css .hljs-class {
  color: #e96900;
}

.javaex-editor-body-container .hljs-value,
.javaex-editor-body-container .hljs-string,
.javaex-editor-preview-html .hljs-value,
.javaex-editor-preview-html .hljs-string {
  color: #42b983;
}

.javaex-editor-body-container .hljs-comment,
.javaex-editor-preview-html .hljs-comment {
  color: #b3b3b3;
}

.javaex-editor-body-container .hljs-regexp,
.javaex-editor-body-container .css .hljs-attribute,
.javaex-editor-preview-html .hljs-regexp,
.javaex-editor-preview-html .css .hljs-attribute {
  color: #af7dff;
}

.javaex-editor-body-container .hljs-built_in,
.javaex-editor-preview-html .hljs-built_in {
  color: #2db7f5;
}

.javaex-editor-body-container .css .hljs-number,
.javaex-editor-body-container .javascript .hljs-number,
.javaex-editor-body-container .actionscript .hljs-literal,
.javaex-editor-body-container .javascript .hljs-literal,
.javaex-editor-preview-html .css .hljs-number,
.javaex-editor-preview-html .javascript .hljs-number,
.javaex-editor-preview-html .actionscript .hljs-literal,
.javaex-editor-preview-html .javascript .hljs-literal {
  color: #fc1e70;
}

.javaex-editor-body-container .hljs-ln-numbers,
.javaex-editor-preview-html .hljs-ln-numbers {
  width: 30px;
  min-width: 30px;
  padding: 0 8px 0 0;
  text-align: right;
  color: #8b97aa;
  user-select: none;
}

.javaex-editor-body-container .hljs-ln,
.javaex-editor-preview-html .hljs-ln {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.javaex-editor-body-container .hljs-ln td,
.javaex-editor-preview-html .hljs-ln td {
  border: 0;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 24px;
  vertical-align: top;
}

.javaex-editor-body-container .hljs-ln-code,
.javaex-editor-preview-html .hljs-ln-code {
  padding-left: 12px;
  white-space: pre-wrap;
}

.javaex-editor-preview-html .javaex-editor-codecopy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.96);
  color: #666;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.javaex-editor-body-container h1,
.javaex-editor-preview-html h1 {
  margin: 28px 0 20px;
  font-size: 32px;
  line-height: 1.25;
  font-weight: 700;
}

.javaex-editor-body-container h2,
.javaex-editor-preview-html h2 {
  margin: 24px 0 18px;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 700;
}

.javaex-editor-body-container h1:first-child,
.javaex-editor-body-container h2:first-child,
.javaex-editor-preview-html h1:first-child,
.javaex-editor-preview-html h2:first-child {
  margin-top: 0;
}

.javaex-editor-body-container h3,
.javaex-editor-preview-html h3 {
  margin: 0 0 16px;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 700;
}

.javaex-editor-body-container h4,
.javaex-editor-preview-html h4 {
  margin: 0 0 14px;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
}

.javaex-editor-body-container h5,
.javaex-editor-preview-html h5 {
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 1.45;
  font-weight: 600;
}

.javaex-editor-body-container h6,
.javaex-editor-preview-html h6 {
  margin: 0 0 12px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
}

.javaex-editor-edit-table,
.javaex-editor-edit-table td,
.javaex-editor-edit-table th,
.javaex-editor-preview-html table,
.javaex-editor-preview-html td,
.javaex-editor-preview-html th {
  border: 1px solid var(--javaex-border-color-light, #eef3fc);
}

.javaex-editor-edit-table,
.javaex-editor-preview-html table {
  width: 100%;
  margin-bottom: 12px;
  border-collapse: collapse;
}

.javaex-editor-edit-table td,
.javaex-editor-edit-table th,
.javaex-editor-preview-html td,
.javaex-editor-preview-html th {
  min-width: 56px;
  padding: 4px 6px;
  line-height: 1.35;
}

.javaex-editor-body-container .hljs-ln td,
.javaex-editor-preview-html .hljs-ln td {
  min-width: 0;
  border: 0;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 24px;
}

.javaex-editor-body-container .hljs-ln-numbers,
.javaex-editor-preview-html .hljs-ln-numbers {
  border-right: 0;
}

.javaex-editor-body-container .hljs-ln td.hljs-ln-numbers,
.javaex-editor-preview-html .hljs-ln td.hljs-ln-numbers {
  border-right: 1px solid #d6dfeb;
}

.javaex-editor-edit-table .javaex-editor-table-head-cell,
.javaex-editor-preview-html .javaex-editor-table-head-cell {
  background: var(--javaex-bg-table-header, rgba(246, 250, 255, 1));
}

.javaex-editor-edit-table .javaex-editor-table-head-bold,
.javaex-editor-preview-html .javaex-editor-table-head-bold {
  font-weight: 700;
}

.javaex-editor-draft-tip {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 50;
  display: none;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--javaex-border-color, #e6eefc);
  border-radius: 999px;
  background: var(--javaex-bg-white-soft-3, rgba(255, 255, 255, 0.98));
  box-shadow: var(--javaex-shadow-xs, 0 2px 6px rgba(31, 42, 68, 0.04));
  color: var(--javaex-text-secondary, #606266);
  font-size: 13px;
}

.javaex-editor-draft-tip.is-open {
  display: inline-flex;
}

.javaex-editor-draft-link {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.javaex-editor-draft-link.blue {
  color: var(--javaex-brand-strong, #1677ff);
}

.javaex-editor-draft-link.red {
  color: var(--javaex-color-danger, #fd4c5b);
}

.javaex-editor-tip {
  position: fixed;
  left: 50%;
  top: 20px;
  z-index: var(--javaex-editor-tip-z-index, 3400);
  display: none;
  transform: translateX(-50%);
  min-width: 280px;
  max-width: 420px;
  padding: 12px 16px;
  border: 1px solid #ccefd2;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(240, 255, 244, 0.96) 0%, rgba(232, 250, 236, 0.96) 100%);
  color: #1f7a34;
  box-shadow: 0 12px 30px rgba(31, 42, 68, 0.12), 0 2px 10px rgba(31, 42, 68, 0.06);
  backdrop-filter: blur(14px);
}

.javaex-editor-tip.is-open {
  display: block;
}

.javaex-editor-tip.error {
  border-color: #ffd6dc;
  background: linear-gradient(135deg, rgba(255, 243, 245, 0.97) 0%, rgba(255, 236, 239, 0.97) 100%);
  color: #d92d43;
}

@keyframes javaex-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export function ensureEditorStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = editorStyleText;
  document.head.appendChild(style);
}

