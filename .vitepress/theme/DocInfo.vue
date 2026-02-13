<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { frontmatter } = useData()
const infoRef = ref<HTMLElement | null>(null)

const wordCount = ref(0)
const readingTime = ref(0)

function calcAndMove() {
  nextTick(() => {
    const vpDoc = document.querySelector('.vp-doc')
    if (!vpDoc) return

    // 计算字数
    const text = vpDoc.textContent || ''
    const cnChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const enWords = text.replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(w => w.length > 0).length
    wordCount.value = cnChars + enWords
    readingTime.value = Math.max(1, Math.ceil((cnChars / 300) + (enWords / 200)))

    // 将组件移动到 h1 标题之后
    const h1 = vpDoc.querySelector('h1')
    if (h1 && infoRef.value) {
      h1.insertAdjacentElement('afterend', infoRef.value)
    }
  })
}

onMounted(calcAndMove)
watch(() => route.path, calcAndMove)
</script>

<template>
  <div v-if="frontmatter.layout !== 'home'" ref="infoRef" class="doc-info">
    <div class="doc-info-item">
      <span class="doc-info-icon">Tr</span>
      <span class="doc-info-label">字数</span>
      <span class="doc-info-value">{{ wordCount }} 字</span>
    </div>
    <div class="doc-info-item">
      <span class="doc-info-icon">⏱</span>
      <span class="doc-info-label">阅读时间</span>
      <span class="doc-info-value">{{ readingTime }} 分钟</span>
    </div>
  </div>
</template>

<style scoped>
.doc-info {
  margin: 16px 0 24px;
  padding: 12px 16px;
  border-left: 3px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.doc-info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.doc-info-icon {
  font-weight: 700;
  font-size: 13px;
  color: var(--vp-c-text-3);
  min-width: 20px;
}

.doc-info-label {
  min-width: 60px;
  color: var(--vp-c-text-3);
}

.doc-info-value {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
</style>
