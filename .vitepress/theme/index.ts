// https://vitepress.dev/guide/custom-theme
import { h, onMounted, watch, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import mediumZoom from 'medium-zoom'
import './style.css'
import VisitorStats from './VisitorStats.vue'
import MermaidEnhancer from './MermaidEnhancer.vue'

const enhanceCodeBlocks = () => {
  nextTick(() => {
    // 代码组
    document.querySelectorAll('.vp-doc .vp-code-group').forEach((group) => {
      if (group.querySelector('.code-group-toolbar')) return
      const tabs = group.querySelector('.tabs')
      if (!tabs) return
      
      const toolbar = document.createElement('div')
      toolbar.className = 'code-group-toolbar'
      toolbar.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;gap:4px;z-index:10;'
      
      // 收起按钮
      const collapseBtn = document.createElement('button')
      collapseBtn.className = 'code-btn'
      collapseBtn.title = '收起/展开'
      collapseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      
      // 复制按钮
      const copyBtn = document.createElement('button')
      copyBtn.className = 'code-btn'
      copyBtn.title = '复制代码'
      copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
      
      let collapsed = false
      collapseBtn.onclick = () => {
        collapsed = !collapsed
        const blocks = group.querySelector('.blocks') as HTMLElement
        if (blocks) {
          if (collapsed) {
            blocks.style.maxHeight = blocks.scrollHeight + 'px'
            blocks.offsetHeight
            blocks.style.maxHeight = '0'
            blocks.style.overflow = 'hidden'
          } else {
            blocks.style.maxHeight = blocks.scrollHeight + 'px'
            blocks.style.overflow = ''
            setTimeout(() => { blocks.style.maxHeight = '' }, 300)
          }
        }
        collapseBtn.innerHTML = collapsed 
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      }
      
      copyBtn.onclick = async () => {
        const code = group.querySelector('div[class*="language-"]:not([style*="display: none"]) code')
        if (code) {
          await navigator.clipboard.writeText(code.textContent || '')
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
          setTimeout(() => {
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
          }, 2000)
        }
      }
      
      toolbar.appendChild(collapseBtn)
      toolbar.appendChild(copyBtn)
      tabs.appendChild(toolbar)
    })
    
    // 独立代码块
    document.querySelectorAll('.vp-doc div[class*="language-"]').forEach((block) => {
      if (block.closest('.vp-code-group')) return
      if (block.querySelector('.code-toolbar')) return
      
      const pre = block.querySelector('pre')
      const code = block.querySelector('code')
      if (!pre || !code) return
      
      const toolbar = document.createElement('div')
      toolbar.className = 'code-toolbar'
      
      const collapseBtn = document.createElement('button')
      collapseBtn.className = 'code-btn'
      collapseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      
      const copyBtn = document.createElement('button')
      copyBtn.className = 'code-btn'
      copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
      
      let collapsed = false
      collapseBtn.onclick = () => {
        collapsed = !collapsed
        const preEl = pre as HTMLElement
        const lineNumbers = block.querySelector('.line-numbers-wrapper') as HTMLElement
        const codeWrapper = block.querySelector('.shiki') || preEl
        if (collapsed) {
          preEl.style.maxHeight = preEl.scrollHeight + 'px'
          preEl.offsetHeight
          preEl.style.maxHeight = '0'
          preEl.style.overflow = 'hidden'
          preEl.style.padding = '0'
        } else {
          preEl.style.padding = ''
          preEl.style.maxHeight = preEl.scrollHeight + 'px'
          preEl.style.overflow = ''
          setTimeout(() => { preEl.style.maxHeight = '' }, 300)
        }
        if (lineNumbers) {
          lineNumbers.style.display = collapsed ? 'none' : ''
        }
        collapseBtn.innerHTML = collapsed 
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'
      }
      
      copyBtn.onclick = async () => {
        await navigator.clipboard.writeText(code.textContent || '')
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
        setTimeout(() => {
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
        }, 2000)
      }
      
      toolbar.appendChild(collapseBtn)
      toolbar.appendChild(copyBtn)
      block.appendChild(toolbar)
      
      const orig = block.querySelector('button.copy')
      if (orig) (orig as HTMLElement).style.display = 'none'
    })
  })
}

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(MermaidEnhancer)
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('VisitorStats', VisitorStats)
  },
  setup() {
    const route = useRoute()
    const initZoom = () => {
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' })
    }
    onMounted(() => {
      initZoom()
      enhanceCodeBlocks()
    })
    watch(() => route.path, () => nextTick(() => {
      initZoom()
      enhanceCodeBlocks()
    }))
  }
} satisfies Theme
