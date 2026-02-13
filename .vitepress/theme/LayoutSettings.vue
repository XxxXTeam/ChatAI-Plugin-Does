<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { inBrowser, useRoute } from 'vitepress'

const show = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const btnRef = ref<HTMLElement | null>(null)

const layoutMode = ref(0)
const pageMaxWidth = ref(1440)
const contentMaxWidth = ref(688)
const spotlight = ref(false)
const spotlightStyle = ref(0) // 0=柔和, 1=硬边

const STORAGE_KEY = 'chatai-layout-settings'

function loadSettings() {
  if (!inBrowser) return
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const s = JSON.parse(saved)
      layoutMode.value = s.layoutMode ?? 0
      pageMaxWidth.value = s.pageMaxWidth ?? 1440
      contentMaxWidth.value = s.contentMaxWidth ?? 688
      spotlight.value = s.spotlight ?? false
      spotlightStyle.value = s.spotlightStyle ?? 0
    }
  } catch {}
}

function saveSettings() {
  if (!inBrowser) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    layoutMode: layoutMode.value,
    pageMaxWidth: pageMaxWidth.value,
    contentMaxWidth: contentMaxWidth.value,
    spotlight: spotlight.value,
    spotlightStyle: spotlightStyle.value
  }))
}

function getStyleEl(): HTMLStyleElement {
  let el = document.getElementById('ls-dynamic-styles') as HTMLStyleElement
  if (!el) {
    el = document.createElement('style')
    el.id = 'ls-dynamic-styles'
    document.head.appendChild(el)
  }
  return el
}

// 直接操作 DOM 内联样式（scoped CSS 无法被外部 <style> 覆盖）
function applyDomStyles() {
  const mode = layoutMode.value
  const pw = pageMaxWidth.value
  const cw = contentMaxWidth.value

  const pageW = mode === 0 ? `${pw}px` : '100%'
  const contentW = mode === 0 ? `${cw}px`
    : mode === 1 ? '960px'
    : '100%'

  // ===== 首页容器宽度（不包含 VPDoc，VPDoc 的结构不同）=====
  const homeSelectors = [
    '.VPHero > .container',
    '.VPFeatures > .container',
    '.VPHomeContent > .container',
    '.VPHomeSponsors > .container',
    '.VPTeamPageTitle > .title',
    '.VPTeamPageSection > .title',
    '.VPTeamMembers > .container',
  ]
  homeSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      (el as HTMLElement).style.setProperty('max-width', pageW, 'important')
    })
  })

  // ===== 文档页内容宽度（只改 .content-container，不碰 .container 和 .content）=====
  document.querySelectorAll('.VPDoc .content-container').forEach(el => {
    (el as HTMLElement).style.setProperty('max-width', contentW, 'important')
  })

  // ===== 布局模式 2/3: 隐藏右侧大纲 =====
  document.querySelectorAll('.VPDoc .aside').forEach(el => {
    if (mode === 2 || mode === 3) {
      (el as HTMLElement).style.setProperty('display', 'none', 'important')
    } else {
      (el as HTMLElement).style.removeProperty('display')
    }
  })

  // ===== 布局模式 3: 禅模式 - 隐藏侧边栏 =====
  const sidebar = document.querySelector('.VPSidebar') as HTMLElement
  const vpContent = document.querySelector('.VPContent.has-sidebar') as HTMLElement
  // 同时处理 VPLocalNav 中的侧边栏按钮
  const localNav = document.querySelector('.VPLocalNav') as HTMLElement

  if (mode === 3) {
    if (sidebar) sidebar.style.setProperty('display', 'none', 'important')
    // 通过修改 CSS 变量让 VPContent 认为侧边栏宽度为 0
    if (vpContent) {
      vpContent.style.setProperty('--vp-sidebar-width', '0px')
    }
    if (localNav) {
      localNav.style.setProperty('--vp-sidebar-width', '0px')
    }
  } else {
    if (sidebar) sidebar.style.removeProperty('display')
    if (vpContent) {
      vpContent.style.removeProperty('--vp-sidebar-width')
    }
    if (localNav) {
      localNav.style.removeProperty('--vp-sidebar-width')
    }
  }
}

// 聚光灯效果用 CSS 注入（需要 :hover 伪类，JS 无法实现）
function buildSpotlightCss(): string {
  if (!spotlight.value) return ''
  const opacity = spotlightStyle.value === 0 ? '0.4' : '0.25'
  const speed = spotlightStyle.value === 0 ? '0.3s' : '0.15s'
  const targets = [
    '.vp-doc p', '.vp-doc li', '.vp-doc td', '.vp-doc th',
    '.vp-doc h1', '.vp-doc h2', '.vp-doc h3', '.vp-doc h4',
    '.vp-doc blockquote', ".vp-doc div[class*='language-']",
    '.VPFeatures .item', '.VPHero .main'
  ]
  let css = `${targets.join(', ')} { opacity: ${opacity}; transition: opacity ${speed} ease; }\n`
  css += `${targets.map(s => s + ':hover').join(', ')} { opacity: 1; }\n`
  if (spotlightStyle.value === 1) {
    css += `${targets.map(s => s + ':hover').join(', ')} {
      background: var(--vp-c-bg-soft); border-radius: 6px;
      box-shadow: 0 0 0 6px var(--vp-c-bg-soft);
    }\n`
  }
  return css
}

function applySettings() {
  if (!inBrowser) return
  document.documentElement.style.removeProperty('--vp-layout-max-width')
  applyDomStyles()
  const el = getStyleEl()
  el.textContent = buildSpotlightCss()
  saveSettings()
}

function setLayout(mode: number) {
  layoutMode.value = mode
  applySettings()
}

function toggleSpotlight(val: boolean) {
  spotlight.value = val
  applySettings()
}

function setSpotlightStyle(val: number) {
  spotlightStyle.value = val
  applySettings()
}

function onClickOutside(e: MouseEvent) {
  if (
    panelRef.value && !panelRef.value.contains(e.target as Node) &&
    btnRef.value && !btnRef.value.contains(e.target as Node)
  ) {
    show.value = false
  }
}

const route = useRoute()

watch([pageMaxWidth, contentMaxWidth], () => {
  applySettings()
})

watch(() => route.path, () => {
  nextTick(() => {
    applySettings()
  })
})

onMounted(() => {
  loadSettings()
  nextTick(() => applySettings())
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

const layoutIcons = [
  { title: '默认布局', svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="12" y="3" width="9" height="18" rx="1"/></svg>` },
  { title: '宽屏布局', svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="7" y1="3" x2="7" y2="21"/></svg>` },
  { title: '全宽布局', svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="1"/></svg>` },
  { title: '禅模式', svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="12" y1="7" x2="16" y2="7"/><line x1="12" y1="11" x2="16" y2="11"/><line x1="12" y1="15" x2="16" y2="15"/></svg>` },
]
</script>

<template>
  <div class="ls-wrapper">
    <button
      ref="btnRef"
      class="ls-trigger"
      :title="'布局设置'"
      @click.stop="show = !show"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      <svg class="ls-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>

    <Transition name="ls-fade">
      <div v-if="show" ref="panelRef" class="ls-panel">
        <!-- 布局切换 -->
        <div class="ls-section">
          <div class="ls-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="12" x2="9" y2="12"/></svg>
            布局切换
            <a class="ls-help" title="切换页面布局模式">?</a>
          </div>
          <div class="ls-layout-btns">
            <button
              v-for="(icon, i) in layoutIcons"
              :key="i"
              :class="['ls-layout-btn', { active: layoutMode === i }]"
              :title="icon.title"
              @click="setLayout(i)"
              v-html="icon.svg"
            />
          </div>
        </div>

        <!-- 页面最大宽度 -->
        <div class="ls-section">
          <div class="ls-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
            页面最大宽度
            <a class="ls-help" title="控制整个页面容器的最大宽度">?</a>
          </div>
          <div class="ls-input-row">
            <input
              type="number"
              class="ls-input"
              v-model.number="pageMaxWidth"
              :min="1000"
              :max="2400"
              :step="40"
            />
            <input
              type="range"
              class="ls-range"
              v-model.number="pageMaxWidth"
              :min="1000"
              :max="2400"
              :step="40"
            />
          </div>
        </div>

        <!-- 内容最大宽度 -->
        <div class="ls-section">
          <div class="ls-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>
            内容最大宽度<span class="ls-tag">AI</span>
            <a class="ls-help" title="控制文档正文区域的最大宽度">?</a>
          </div>
          <div class="ls-input-row">
            <input
              type="number"
              class="ls-input"
              v-model.number="contentMaxWidth"
              :min="400"
              :max="1200"
              :step="16"
            />
            <input
              type="range"
              class="ls-range"
              v-model.number="contentMaxWidth"
              :min="400"
              :max="1200"
              :step="16"
            />
          </div>
        </div>

        <!-- 聚光灯 -->
        <div class="ls-section">
          <div class="ls-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            聚光灯
          </div>
          <div class="ls-toggle-row">
            <button
              :class="['ls-toggle-btn', { active: spotlight }]"
              @click="toggleSpotlight(true)"
            >ON</button>
            <button
              :class="['ls-toggle-btn', { active: !spotlight }]"
              @click="toggleSpotlight(false)"
            >OFF</button>
          </div>
        </div>

        <!-- 聚光灯样式 -->
        <div class="ls-section">
          <div class="ls-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
            聚光灯样式
          </div>
          <div class="ls-toggle-row">
            <button
              :class="['ls-style-btn', { active: spotlightStyle === 0 }]"
              @click="setSpotlightStyle(0)"
              title="柔和渐变"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>
            </button>
            <button
              :class="['ls-style-btn', { active: spotlightStyle === 1 }]"
              @click="setSpotlightStyle(1)"
              title="硬边高亮"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="0"/><path d="M8 9h8M8 12h8M8 15h5"/><line x1="4" y1="11" x2="20" y2="11" stroke-width="2"/><line x1="4" y1="13" x2="20" y2="13" stroke-width="2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.ls-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.ls-trigger {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 4px 6px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}
.ls-trigger:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}
.ls-caret {
  margin-left: 1px;
  opacity: 0.6;
}

.ls-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  padding: 16px;
  z-index: 100;
}

.ls-section {
  margin-bottom: 16px;
}
.ls-section:last-child {
  margin-bottom: 0;
}

.ls-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.ls-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
  font-size: 10px;
  color: var(--vp-c-text-3);
  cursor: help;
  margin-left: auto;
  text-decoration: none;
}

.ls-tag {
  font-size: 10px;
  padding: 1px 5px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  font-weight: 500;
}

/* 布局按钮 */
.ls-layout-btns {
  display: flex;
  gap: 6px;
}
.ls-layout-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}
.ls-layout-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.ls-layout-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* 输入框行 */
.ls-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ls-input {
  width: 72px;
  padding: 5px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  text-align: center;
  outline: none;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
  appearance: textfield;
}
.ls-input::-webkit-inner-spin-button,
.ls-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.ls-input:focus {
  border-color: var(--vp-c-brand-1);
}
.ls-range {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--vp-c-divider);
  outline: none;
}
.ls-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.ls-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  border: 2px solid var(--vp-c-bg);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

/* ON/OFF 按钮 */
.ls-toggle-row {
  display: flex;
  gap: 6px;
}
.ls-toggle-btn {
  flex: 1;
  padding: 6px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.ls-toggle-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.ls-toggle-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* 样式按钮 */
.ls-style-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}
.ls-style-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.ls-style-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* 面板过渡动画 */
.ls-fade-enter-active,
.ls-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.ls-fade-enter-from,
.ls-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
