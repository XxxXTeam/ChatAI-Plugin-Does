<script setup>
/**
 * AI 页面摘要组件
 * 
 * 功能：
 * - AI 摘要：点击展开请求 AI 总结当前页面
 * - 章节导航：提取页面标题快速跳转
 * - 关联文档：根据侧边栏配置推荐同组文档
 * - 源文件：显示当前页面的 Markdown 源文件路径
 */
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, frontmatter, theme } = useData()
const route = useRoute()

const API_URL = import.meta.env.VITE_AI_CHAT_API_URL || ''

const isExpanded = ref(false)
const isLoading = ref(false)
const summary = ref('')
const hasError = ref(false)
const headings = ref([])
const hasApiUrl = API_URL !== ''

/* ==================== 页面信息提取 ==================== */

/**
 * 源文件路径（去掉 .md 扩展名前缀即为路由）
 */
const sourceFile = computed(() => page.value?.relativePath || '')

/**
 * 从 DOM 提取当前页面的 h2/h3 标题用于章节跳转
 */
function extractHeadings() {
  nextTick(() => {
    const els = document.querySelectorAll('.vp-doc h2, .vp-doc h3')
    const list = []
    els.forEach(el => {
      const id = el.id
      const text = el.textContent?.replace(/\u200B/g, '').replace(/#/g, '').trim()
      if (id && text) {
        list.push({
          level: el.tagName === 'H2' ? 2 : 3,
          text,
          id,
        })
      }
    })
    headings.value = list
  })
}

/**
 * 从侧边栏配置中查找当前页面所在分组的同级文档
 */
const relatedDocs = computed(() => {
  const sidebar = theme.value?.sidebar
  if (!sidebar || typeof sidebar !== 'object') return []

  const currentPath = route.path

  for (const key in sidebar) {
    if (!currentPath.startsWith(key)) continue
    const groups = sidebar[key]
    if (!Array.isArray(groups)) continue

    for (const group of groups) {
      if (!group.items) continue
      const inGroup = group.items.some(item =>
        currentPath === item.link || currentPath === item.link + '.html' ||
        currentPath.replace(/\/$/, '') === item.link.replace(/\/$/, '')
      )
      if (inGroup) {
        return group.items
          .filter(item => {
            const itemPath = item.link.replace(/\/$/, '')
            const curPath = currentPath.replace(/\/$/, '')
            return itemPath !== curPath
          })
          .map(item => ({ text: item.text, link: item.link }))
      }
    }
  }
  return []
})

/* ==================== AI 摘要 ==================== */

function cacheKey() { return `ai-summary:${route.path}` }

function toggle() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && !summary.value && !isLoading.value) {
    fetchSummary()
  }
}

function getPageTitle() {
  return page.value?.title || frontmatter.value?.title || document.title || ''
}

async function fetchSummary() {
  const cached = sessionStorage.getItem(cacheKey())
  if (cached) { summary.value = cached; return }

  const title = getPageTitle()
  if (!title) return

  isLoading.value = true
  hasError.value = false
  summary.value = ''

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: `简洁回答3-5句话总结「${title}」页面的核心内容。`
      }),
    })

    if (!response.ok) throw new Error(`请求失败 (${response.status})`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) summary.value += delta
        } catch { /* 忽略 */ }
      }
    }

    if (summary.value) sessionStorage.setItem(cacheKey(), summary.value)
  } catch {
    hasError.value = true
    summary.value = '获取摘要失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

/* ==================== 内联渲染 ==================== */

function escapeHtml(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderInline(text) {
  if (!text) return ''
  const slots = []
  const ph = (h) => { slots.push(h); return `%%S${slots.length - 1}%%` }
  let s = text.replace(/`([^`]+)`/g, (_, c) => ph(`<code class="s-code">${escapeHtml(c)}</code>`))
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  s = s.replace(/%%S(\d+)%%/g, (_, i) => slots[Number(i)])
  return s
}

const renderedSummary = computed(() => {
  if (!summary.value) return ''
  return summary.value.split('\n').map(l => renderInline(l)).join('<br>')
})

/* ==================== 生命周期 ==================== */

onMounted(() => extractHeadings())

watch(() => route.path, () => {
  isExpanded.value = false
  summary.value = ''
  isLoading.value = false
  hasError.value = false
  extractHeadings()
})
</script>

<template>
  <div v-if="hasApiUrl && page?.title" class="ai-summary" :class="{ 'is-expanded': isExpanded }">
    <!-- 触发按钮 -->
    <button class="ai-summary-trigger" @click="toggle">
      <span class="ai-summary-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a8 8 0 0 1 8 8v2a8 8 0 0 1-16 0v-2a8 8 0 0 1 8-8z"/>
          <path d="M9 10h.01"/><path d="M15 10h.01"/>
          <path d="M9.5 15a3.5 3.5 0 0 0 5 0"/>
        </svg>
      </span>
      <span class="ai-summary-label">AI 摘要</span>
      <svg class="ai-summary-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>

    <!-- 展开内容 -->
    <div v-if="isExpanded" class="ai-summary-body">

      <!-- AI 总结 -->
      <div class="ai-section">
        <div class="ai-section-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>摘要</span>
        </div>
        <div v-if="isLoading" class="ai-summary-loading">
          <span class="ai-dot"></span><span class="ai-dot"></span><span class="ai-dot"></span>
          <span class="ai-loading-text">正在生成...</span>
        </div>
        <div v-else-if="summary" class="ai-summary-content" :class="{ 'has-error': hasError }" v-html="renderedSummary"></div>
      </div>

      <!-- 章节导航 -->
      <div v-if="headings.length" class="ai-section">
        <div class="ai-section-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>章节导航</span>
        </div>
        <div class="ai-tags">
          <a v-for="h in headings" :key="h.id"
            :href="'#' + h.id"
            class="ai-tag"
            :class="{ 'is-sub': h.level === 3 }"
          >{{ h.text }}</a>
        </div>
      </div>

      <!-- 关联文档 -->
      <div v-if="relatedDocs.length" class="ai-section">
        <div class="ai-section-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span>关联文档</span>
        </div>
        <div class="ai-tags">
          <a v-for="doc in relatedDocs" :key="doc.link" :href="doc.link" class="ai-tag ai-tag-doc">{{ doc.text }}</a>
        </div>
      </div>

      <!-- 源文件 -->
      <div v-if="sourceFile" class="ai-section ai-source">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
        <span>{{ sourceFile }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-summary {
  margin: 16px 0 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
  background: var(--vp-c-bg-soft);
}

.ai-summary:hover {
  border-color: var(--vp-c-brand-soft);
}

.ai-summary.is-expanded {
  border-color: var(--vp-c-brand-1);
  background: linear-gradient(135deg, var(--vp-c-brand-soft), transparent 60%);
}

/* 触发按钮 */
.ai-summary-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  transition: color 0.15s;
}

.ai-summary-trigger:hover { color: var(--vp-c-brand-1); }
.ai-summary.is-expanded .ai-summary-trigger { color: var(--vp-c-brand-1); }

.ai-summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.ai-summary-label { flex: 1; text-align: left; }

.ai-summary-arrow { transition: transform 0.2s; flex-shrink: 0; }
.ai-summary.is-expanded .ai-summary-arrow { transform: rotate(180deg); }

/* 展开区域 */
.ai-summary-body {
  padding: 0 14px 14px;
  animation: ai-fade-in 0.2s ease;
}

/* 各功能区 */
.ai-section {
  padding: 8px 0;
}

.ai-section + .ai-section {
  border-top: 1px dashed var(--vp-c-divider);
}

.ai-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ai-section-title svg { color: var(--vp-c-brand-1); }

/* AI 摘要内容 */
.ai-summary-content {
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.ai-summary-content :deep(.s-code) {
  background: var(--vp-c-bg-mute);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
}

.ai-summary-content :deep(strong) { font-weight: 600; }
.ai-summary-content :deep(a) { color: var(--vp-c-brand-1); text-decoration: underline; }
.ai-summary-content.has-error { color: var(--vp-c-danger-1); }

/* 标签式导航 */
.ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 14px;
  font-size: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
  white-space: nowrap;
}

.ai-tag:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.ai-tag.is-sub {
  font-size: 11px;
  padding: 2px 8px;
  opacity: 0.8;
}

.ai-tag-doc {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: transparent;
}

.ai-tag-doc:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

/* 源文件路径 */
.ai-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

/* 加载动画 */
.ai-summary-loading {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.ai-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  animation: ai-bounce 1.4s infinite ease-in-out both;
}

.ai-dot:nth-child(1) { animation-delay: 0s; }
.ai-dot:nth-child(2) { animation-delay: 0.16s; }
.ai-dot:nth-child(3) { animation-delay: 0.32s; }

.ai-loading-text {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-left: 6px;
}

@keyframes ai-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes ai-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
