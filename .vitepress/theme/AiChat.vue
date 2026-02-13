<script setup>
/**
 * AI 文档问答助手组件（右侧面板样式）
 * 
 * 功能：
 * - 右侧固定全高面板（类似 Windsurf Docs Assistant）
 * - 右下角浮动触发按钮
 * - 流式响应展示
 * - 复制回答按钮
 * - 新建对话按钮
 * - 适配 VitePress 深色/浅色主题
 * - 示例问题引导
 */
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'

/* ==================== 配置 ==================== */
const API_URL = import.meta.env.VITE_AI_CHAT_API_URL || ''

const EXAMPLE_QUESTIONS = [
  '如何安装 ChatAI Plugin？',
  '怎么配置多个 API 渠道？',
  '伪人模式是什么？怎么开启？',
  'MCP 工具怎么使用？',
]

/* ==================== 状态 ==================== */
const isOpen = ref(false)
const isLoading = ref(false)
const inputText = ref('')
const messages = ref([])
const chatContainer = ref(null)
const inputRef = ref(null)
const copiedIdx = ref(-1)
const hasApiUrl = computed(() => !!API_URL)

/* ==================== 消息处理 ==================== */
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function sendMessage(text) {
  const question = (text || inputText.value).trim()
  if (!question || isLoading.value) return

  inputText.value = ''
  messages.value.push({ role: 'user', content: question })
  scrollToBottom()

  isLoading.value = true
  const aiMessageIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '', loading: true })
  scrollToBottom()

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `请求失败 (${response.status})`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    messages.value[aiMessageIndex].loading = false

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
          if (delta) {
            messages.value[aiMessageIndex].content += delta
            scrollToBottom()
          }
        } catch { /* 忽略解析错误 */ }
      }
    }

    if (!messages.value[aiMessageIndex].content) {
      messages.value[aiMessageIndex].content = '抱歉，未能获取到回答，请稍后重试。'
    }
  } catch (err) {
    console.error('[AI Chat] 错误:', err)
    messages.value[aiMessageIndex].loading = false
    messages.value[aiMessageIndex].content = `出错了：${err.message}`
    messages.value[aiMessageIndex].error = true
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

/* ==================== UI 交互 ==================== */
function togglePanel() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => inputRef.value?.focus())
  }
}

function newChat() {
  messages.value = []
  nextTick(() => inputRef.value?.focus())
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

/* ==================== 复制功能 ==================== */
async function copyMessage(idx) {
  const msg = messages.value[idx]
  if (!msg || !msg.content) return
  try {
    await navigator.clipboard.writeText(msg.content)
    copiedIdx.value = idx
    setTimeout(() => { copiedIdx.value = -1 }, 2000)
  } catch { /* 复制失败静默处理 */ }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

/* ==================== Markdown 简易渲染 ==================== */
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <template v-if="hasApiUrl">
    <!-- 右下角触发按钮 -->
    <button
      class="ai-trigger-btn"
      :class="{ 'is-hidden': isOpen }"
      @click="togglePanel"
      title="Ask AI"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span>Ask AI</span>
    </button>

    <!-- 右侧面板遮罩（移动端） -->
    <Transition name="ai-overlay">
      <div v-if="isOpen" class="ai-panel-overlay" @click="isOpen = false"></div>
    </Transition>

    <!-- 右侧面板 -->
    <Transition name="ai-panel">
      <aside v-if="isOpen" class="ai-panel">
        <!-- 面板头部 -->
        <div class="ai-panel-header">
          <div class="ai-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Assistant</span>
          </div>
          <div class="ai-panel-actions">
            <!-- 新建对话 -->
            <button class="ai-icon-btn" @click="newChat" title="新建对话">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <!-- 关闭面板 -->
            <button class="ai-icon-btn" @click="isOpen = false" title="关闭 (Esc)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 消息区域 -->
        <div class="ai-panel-body" ref="chatContainer">
          <!-- 空状态：欢迎 + 示例问题 -->
          <div v-if="messages.length === 0" class="ai-welcome">
            <div class="ai-welcome-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2a8 8 0 0 1 8 8v2a8 8 0 0 1-16 0v-2a8 8 0 0 1 8-8z"/>
                <path d="M9 10h.01"/>
                <path d="M15 10h.01"/>
                <path d="M9.5 15a3.5 3.5 0 0 0 5 0"/>
              </svg>
            </div>
            <p class="ai-welcome-text">你好！问我任何关于 ChatAI Plugin 的问题，我会从文档中检索相关内容来回答。</p>
            <div class="ai-examples">
              <button
                v-for="q in EXAMPLE_QUESTIONS"
                :key="q"
                class="ai-example-btn"
                @click="sendMessage(q)"
              >{{ q }}</button>
            </div>
          </div>

          <!-- 消息列表 -->
          <template v-for="(msg, idx) in messages" :key="idx">
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'" class="ai-msg ai-msg-user">
              <div class="ai-msg-bubble ai-msg-bubble-user">{{ msg.content }}</div>
            </div>

            <!-- AI 回复 -->
            <div v-else class="ai-msg ai-msg-assistant">
              <div class="ai-msg-bubble ai-msg-bubble-ai" :class="{ 'ai-msg-error': msg.error }">
                <!-- 加载动画 -->
                <div v-if="msg.loading" class="ai-typing">
                  <span></span><span></span><span></span>
                </div>
                <!-- 回答内容 -->
                <div v-else v-html="renderMarkdown(msg.content)"></div>
              </div>
              <!-- 操作按钮（回答完成后显示） -->
              <div v-if="!msg.loading && msg.content && !msg.error" class="ai-msg-actions">
                <button class="ai-action-btn" @click="copyMessage(idx)" :title="copiedIdx === idx ? '已复制' : '复制'">
                  <!-- 复制图标 / 已复制图标 -->
                  <svg v-if="copiedIdx !== idx" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- 底部输入区 -->
        <div class="ai-panel-footer">
          <div class="ai-input-box" :class="{ 'is-focused': false }">
            <textarea
              ref="inputRef"
              v-model="inputText"
              @keydown="handleKeydown"
              placeholder="Ask a question..."
              rows="1"
              :disabled="isLoading"
            ></textarea>
            <button
              class="ai-send-btn"
              @click="sendMessage()"
              :disabled="!inputText.trim() || isLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </template>
</template>

<style scoped>
/* ==================== 触发按钮 ==================== */
.ai-trigger-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 50;
  transition: all 0.3s ease;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  font-size: 13px;
  font-weight: 500;
}

.ai-trigger-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.ai-trigger-btn.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.9);
}

/* ==================== 右侧面板 ==================== */
.ai-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 200;
  background: var(--vp-c-bg);
  border-left: 1px solid var(--vp-c-divider);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.06);
}

.ai-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 199;
  background: rgba(0, 0, 0, 0.3);
}

/* ==================== 面板头部 ==================== */
.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.ai-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.ai-panel-title svg {
  color: var(--vp-c-brand-1);
}

.ai-panel-actions {
  display: flex;
  gap: 2px;
}

.ai-icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.ai-icon-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

/* ==================== 消息区域 ==================== */
.ai-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.ai-panel-body::-webkit-scrollbar {
  width: 4px;
}

.ai-panel-body::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

/* ==================== 欢迎页 ==================== */
.ai-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 8px 16px;
  text-align: center;
}

.ai-welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.ai-welcome-text {
  margin: 0 0 24px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.ai-examples {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-example-btn {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.ai-example-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* ==================== 消息样式 ==================== */
.ai-msg {
  margin-bottom: 16px;
}

/* 用户消息：右对齐 */
.ai-msg-user {
  display: flex;
  justify-content: flex-end;
}

.ai-msg-bubble-user {
  max-width: 85%;
  padding: 8px 14px;
  border-radius: 16px 16px 4px 16px;
  font-size: 14px;
  line-height: 1.5;
  background: var(--vp-c-brand-1);
  color: white;
  word-break: break-word;
}

/* AI 回复：左对齐，无背景 */
.ai-msg-assistant {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ai-msg-bubble-ai {
  max-width: 100%;
  padding: 4px 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  word-break: break-word;
}

.ai-msg-error {
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

/* AI 消息操作按钮 */
.ai-msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.ai-msg-assistant:hover .ai-msg-actions {
  opacity: 1;
}

.ai-action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.ai-action-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-3);
}

/* 代码和内联样式 */
.ai-msg-bubble-ai :deep(.ai-code-block) {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 10px 12px;
  margin: 8px 0;
  overflow-x: auto;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
}

.ai-msg-bubble-ai :deep(.ai-inline-code) {
  background: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
}

.ai-msg-bubble-ai :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.ai-msg-bubble-ai :deep(ul) {
  margin: 4px 0;
  padding-left: 18px;
}

.ai-msg-bubble-ai :deep(li) {
  margin: 2px 0;
}

.ai-msg-bubble-ai :deep(strong) {
  font-weight: 600;
}

.ai-msg-bubble-ai :deep(h3),
.ai-msg-bubble-ai :deep(h4) {
  margin: 12px 0 4px;
  font-size: 14px;
  font-weight: 600;
}

/* ==================== 打字动画 ==================== */
.ai-typing {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.ai-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  animation: ai-bounce 1.4s infinite ease-in-out both;
}

.ai-typing span:nth-child(1) { animation-delay: 0s; }
.ai-typing span:nth-child(2) { animation-delay: 0.16s; }
.ai-typing span:nth-child(3) { animation-delay: 0.32s; }

@keyframes ai-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* ==================== 底部输入区 ==================== */
.ai-panel-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.ai-input-box {
  display: flex;
  align-items: flex-end;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 6px 6px 6px 12px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.2s;
}

.ai-input-box:focus-within {
  border-color: var(--vp-c-brand-1);
}

.ai-input-box textarea {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
  max-height: 80px;
  padding: 4px 0;
}

.ai-input-box textarea::placeholder {
  color: var(--vp-c-text-3);
}

.ai-send-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
  background: var(--vp-c-brand-1);
  color: white;
}

.ai-send-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.ai-send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ==================== 面板动画 ==================== */
.ai-panel-enter-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-panel-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-panel-enter-from,
.ai-panel-leave-to {
  transform: translateX(100%);
}

.ai-overlay-enter-active {
  transition: opacity 0.25s;
}

.ai-overlay-leave-active {
  transition: opacity 0.2s;
}

.ai-overlay-enter-from,
.ai-overlay-leave-to {
  opacity: 0;
}

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .ai-panel {
    width: 100vw;
  }

  .ai-trigger-btn {
    bottom: 16px;
    right: 16px;
  }
}

@media (min-width: 769px) {
  .ai-panel-overlay {
    display: none;
  }
}
</style>
