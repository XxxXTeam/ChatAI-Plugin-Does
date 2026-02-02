<script setup>
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const enhanceMermaid = () => {
  nextTick(() => {
    setTimeout(() => {
      const mermaidBlocks = document.querySelectorAll('.mermaid')
      
      mermaidBlocks.forEach((block) => {
        // 如果已经增强过，跳过
        if (block.parentElement?.classList.contains('mermaid-wrapper')) return
        
        // 创建包装容器
        const wrapper = document.createElement('div')
        wrapper.className = 'mermaid-wrapper'
        
        // 创建工具栏
        const toolbar = document.createElement('div')
        toolbar.className = 'mermaid-toolbar'
        
        // 放大按钮
        const zoomInBtn = document.createElement('button')
        zoomInBtn.className = 'mermaid-btn'
        zoomInBtn.title = '放大'
        zoomInBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`
        
        // 缩小按钮
        const zoomOutBtn = document.createElement('button')
        zoomOutBtn.className = 'mermaid-btn'
        zoomOutBtn.title = '缩小'
        zoomOutBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`
        
        // 重置按钮
        const resetBtn = document.createElement('button')
        resetBtn.className = 'mermaid-btn'
        resetBtn.title = '重置'
        resetBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`
        
        // 全屏按钮
        const fullscreenBtn = document.createElement('button')
        fullscreenBtn.className = 'mermaid-btn'
        fullscreenBtn.title = '全屏查看'
        fullscreenBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`
        
        let scale = 1
        let translateX = 0
        let translateY = 0
        let isDragging = false
        let startX = 0
        let startY = 0
        const minScale = 0.5
        const maxScale = 3
        
        // 更新变换
        const updateTransform = () => {
          const svg = block.querySelector('svg')
          if (svg) {
            svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
            svg.style.transformOrigin = 'center center'
          }
        }
        
        // 鼠标滚轮缩放
        block.addEventListener('wheel', (e) => {
          e.preventDefault()
          const delta = e.deltaY > 0 ? -0.1 : 0.1
          const newScale = Math.max(minScale, Math.min(maxScale, scale + delta))
          scale = newScale
          updateTransform()
        }, { passive: false })
        
        // 拖拽平移
        block.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return // 只响应左键
          isDragging = true
          startX = e.clientX - translateX
          startY = e.clientY - translateY
          block.style.cursor = 'grabbing'
        })
        
        document.addEventListener('mousemove', (e) => {
          if (!isDragging) return
          translateX = e.clientX - startX
          translateY = e.clientY - startY
          updateTransform()
        })
        
        document.addEventListener('mouseup', () => {
          isDragging = false
          block.style.cursor = 'grab'
        })
        
        // 设置初始鼠标样式
        block.style.cursor = 'grab'
        
        zoomInBtn.addEventListener('click', () => {
          if (scale < maxScale) {
            scale = Math.min(scale + 0.25, maxScale)
            updateTransform()
          }
        })
        
        zoomOutBtn.addEventListener('click', () => {
          if (scale > minScale) {
            scale = Math.max(scale - 0.25, minScale)
            updateTransform()
          }
        })
        
        resetBtn.addEventListener('click', () => {
          scale = 1
          translateX = 0
          translateY = 0
          updateTransform()
        })
        
        // 全屏功能
        fullscreenBtn.addEventListener('click', () => {
          const modal = document.createElement('div')
          modal.className = 'mermaid-modal'
          modal.innerHTML = `
            <div class="mermaid-modal-content">
              <button class="mermaid-modal-close">&times;</button>
              <div class="mermaid-modal-body">${block.innerHTML}</div>
            </div>
          `
          document.body.appendChild(modal)
          
          modal.querySelector('.mermaid-modal-close')?.addEventListener('click', () => {
            modal.remove()
          })
          
          modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove()
          })
        })
        
        toolbar.appendChild(zoomInBtn)
        toolbar.appendChild(zoomOutBtn)
        toolbar.appendChild(resetBtn)
        toolbar.appendChild(fullscreenBtn)
        
        // 包装原始元素
        block.parentNode?.insertBefore(wrapper, block)
        wrapper.appendChild(toolbar)
        wrapper.appendChild(block)
      })
    }, 500) // 等待 mermaid 渲染完成
  })
}

onMounted(() => {
  enhanceMermaid()
})

watch(() => route.path, () => {
  setTimeout(enhanceMermaid, 600)
})
</script>

<template>
  <ClientOnly>
    <div class="mermaid-enhancer"></div>
  </ClientOnly>
</template>

<style>
.mermaid-enhancer {
  display: none;
}

/* Mermaid 包装容器 */
.mermaid-wrapper {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
  background: var(--vp-c-bg-soft);
}

/* Mermaid 工具栏 */
.mermaid-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 4px;
  background: var(--vp-c-bg);
  padding: 4px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mermaid-wrapper:hover .mermaid-toolbar {
  opacity: 1;
}

/* 工具栏按钮 */
.mermaid-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mermaid-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* Mermaid 内容区域 */
.mermaid-wrapper .mermaid {
  padding: 1.5rem;
  overflow: auto;
  display: flex;
  justify-content: center;
}

.mermaid-wrapper .mermaid svg {
  transition: transform 0.2s ease;
  max-width: none;
}

/* 全屏模态框 */
.mermaid-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.mermaid-modal-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  max-width: 95vw;
  max-height: 95vh;
  overflow: auto;
  position: relative;
}

.mermaid-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--vp-c-bg-soft);
  border: none;
  font-size: 24px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-1);
  z-index: 1;
}

.mermaid-modal-close:hover {
  background: var(--vp-c-bg-mute);
}

.mermaid-modal-body {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.mermaid-modal-body svg {
  max-width: 100%;
  height: auto;
}
</style>
