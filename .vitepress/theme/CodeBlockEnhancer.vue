<script setup>
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const createToolbar = (getCode, onCollapse) => {
  const toolbar = document.createElement('div')
  toolbar.className = 'code-toolbar'
  
  // 收起按钮
  const collapseBtn = document.createElement('button')
  collapseBtn.className = 'code-btn'
  collapseBtn.title = '收起/展开'
  collapseBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`
  
  // 复制按钮
  const copyBtn = document.createElement('button')
  copyBtn.className = 'code-btn'
  copyBtn.title = '复制代码'
  copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
  
  let isCollapsed = false
  
  collapseBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed
    onCollapse(isCollapsed)
    collapseBtn.innerHTML = isCollapsed 
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`
  })
  
  copyBtn.addEventListener('click', async () => {
    try {
      const code = getCode()
      await navigator.clipboard.writeText(code?.textContent || '')
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
      copyBtn.classList.add('copied')
      setTimeout(() => {
        copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
        copyBtn.classList.remove('copied')
      }, 2000)
    } catch (e) {
      console.error('复制失败', e)
    }
  })
  
  toolbar.appendChild(collapseBtn)
  toolbar.appendChild(copyBtn)
  return toolbar
}

const enhanceCodeBlocks = () => {
  console.log('enhanceCodeBlocks called')
  nextTick(() => {
    const codeGroups = document.querySelectorAll('.vp-doc .vp-code-group')
    console.log('Found code groups:', codeGroups.length)
    codeGroups.forEach((group) => {
      if (group.querySelector('.code-group-toolbar')) return
      
      const tabs = group.querySelector('.tabs')
      if (!tabs) return
      
      // 工具栏直接放在 tabs 内
      const toolbar = createToolbar(
        () => group.querySelector('div[class*="language-"]:not([style*="display: none"]) code'),
        (collapsed) => {
          group.querySelectorAll('div[class*="language-"]').forEach(block => {
            const pre = block.querySelector('pre')
            if (pre) {
              pre.style.maxHeight = collapsed ? '0' : ''
              pre.style.overflow = collapsed ? 'hidden' : ''
              pre.style.padding = collapsed ? '0' : ''
            }
          })
          group.classList.toggle('collapsed', collapsed)
        }
      )
      toolbar.className = 'code-group-toolbar'
      toolbar.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;gap:4px;z-index:10;'
      tabs.appendChild(toolbar)
      console.log('Code group toolbar added:', toolbar)
    })
    document.querySelectorAll('.vp-doc div[class*="language-"]').forEach((block) => {
      if (block.closest('.vp-code-group')) return
      if (block.querySelector('.code-toolbar')) return
      
      const pre = block.querySelector('pre')
      const code = block.querySelector('code')
      if (!pre || !code) return
      
      const toolbar = createToolbar(
        () => code,
        (collapsed) => {
          pre.style.maxHeight = collapsed ? '0' : ''
          pre.style.overflow = collapsed ? 'hidden' : ''
          pre.style.padding = collapsed ? '0' : ''
          block.classList.toggle('collapsed', collapsed)
        }
      )
      
      block.appendChild(toolbar)
      
      const originalCopy = block.querySelector('button.copy')
      if (originalCopy) originalCopy.style.display = 'none'
    })
  })
}

onMounted(() => {
  enhanceCodeBlocks()
})

watch(() => route.path, () => {
  setTimeout(enhanceCodeBlocks, 100)
})
</script>

<template>
  <ClientOnly>
    <div class="code-block-enhancer"></div>
  </ClientOnly>
</template>

<style>
.code-block-enhancer {
  display: none;
}

/* 独立代码块工具栏 */
.vp-doc div[class*='language-'] .code-toolbar {
  position: absolute;
  top: 0.55rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 代码组工具栏 - 在 tabs 右侧 */
.code-group-toolbar {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
}

.code-group-toolbar .code-btn {
  color: var(--vp-c-text-2);
}

.code-group-toolbar .code-btn:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

/* 按钮基础样式 */
.code-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.code-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.code-btn.copied {
  color: #28ca42;
}

/* 代码区域过渡动画 */
.vp-doc div[class*='language-'] pre {
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.vp-doc div[class*='language-'].collapsed pre {
  border-top: none;
}
</style>
