# 聊天服务

ChatService 是处理 AI 对话的核心服务。

## 职责

- 管理对话上下文
- 调用 LLM 适配器
- 处理工具调用循环
- 格式化响应

## 核心接口

```javascript
// services/llm/ChatService.js
export class ChatService {
  constructor(options) {
    this.adapter = options.adapter
    this.agent = options.agent
    this.context = options.context
  }
  
  // 主聊天方法
  async chat(message, options = {}) {
    // 构建消息列表
    const messages = await this.buildMessages(message)
    
    // 获取工具定义
    const tools = this.agent?.getToolDefinitions() || []
    
    // 调用 AI
    let response = await this.adapter.chat({ messages, tools })
    
    // 处理工具调用
    response = await this.handleToolCalls(response, messages)
    
    // 保存上下文
    await this.saveContext(message, response.content)
    
    return response.content
  }
  
  // 流式聊天
  async *streamChat(message, options = {}) {
    const messages = await this.buildMessages(message)
    const tools = this.agent?.getToolDefinitions() || []
    
    for await (const chunk of this.adapter.stream({ messages, tools })) {
      yield chunk
    }
  }
}
```

## 消息构建

```javascript
async buildMessages(userMessage) {
  const messages = []
  
  // 系统提示
  if (this.context.systemPrompt) {
    messages.push({
      role: 'system',
      content: this.context.systemPrompt
    })
  }
  
  // 历史消息
  const history = await this.context.getHistory()
  messages.push(...history)
  
  // 记忆检索
  if (this.context.memoryEnabled) {
    const memories = await this.retrieveMemories(userMessage)
    if (memories.length > 0) {
      messages.push({
        role: 'system',
        content: `相关记忆：\n${memories.join('\n')}`
      })
    }
  }
  
  // 用户消息
  messages.push({
    role: 'user',
    content: userMessage
  })
  
  return messages
}
```

## 工具调用处理

```javascript
async handleToolCalls(response, messages) {
  let toolCalls = this.adapter.parseToolCalls(response)
  
  // 工具调用循环
  while (toolCalls.length > 0) {
    // 执行工具
    const results = await this.executeTools(toolCalls)
    
    // 添加助手消息
    messages.push({
      role: 'assistant',
      content: response.content,
      tool_calls: toolCalls
    })
    
    // 添加工具结果
    for (const result of results) {
      messages.push({
        role: 'tool',
        tool_call_id: result.id,
        content: JSON.stringify(result.output)
      })
    }
    
    // 继续对话
    response = await this.adapter.chat({
      messages,
      tools: this.agent.getToolDefinitions()
    })
    
    toolCalls = this.adapter.parseToolCalls(response)
  }
  
  return response
}

async executeTools(toolCalls) {
  const results = []
  
  // 并行执行
  const promises = toolCalls.map(async call => {
    try {
      const output = await this.agent.execute(
        call.function.name,
        JSON.parse(call.function.arguments)
      )
      return { id: call.id, output, success: true }
    } catch (error) {
      return { id: call.id, output: error.message, success: false }
    }
  })
  
  return await Promise.all(promises)
}
```

## 上下文管理

```javascript
class ChatContext {
  constructor(options) {
    this.userId = options.userId
    this.groupId = options.groupId
    this.maxMessages = options.maxMessages || 20
    this.messages = []
  }
  
  async getHistory() {
    // 从数据库加载
    if (this.messages.length === 0) {
      this.messages = await this.loadFromDb()
    }
    
    // 应用清理策略
    return this.applyCleaningStrategy(this.messages)
  }
  
  async addMessage(role, content) {
    this.messages.push({ role, content, timestamp: Date.now() })
    await this.saveToDb()
  }
  
  applyCleaningStrategy(messages) {
    if (messages.length <= this.maxMessages) {
      return messages
    }
    
    // 滑动窗口
    return messages.slice(-this.maxMessages)
  }
  
  async clear() {
    this.messages = []
    await this.clearFromDb()
  }
}
```

## 流式响应

```javascript
async *streamChat(message, onToolCall) {
  const messages = await this.buildMessages(message)
  const tools = this.agent?.getToolDefinitions() || []
  
  let fullContent = ''
  let pendingToolCalls = []
  
  for await (const chunk of this.adapter.stream({ messages, tools })) {
    // 输出内容
    if (chunk.content) {
      fullContent += chunk.content
      yield { type: 'content', data: chunk.content }
    }
    
    // 收集工具调用
    if (chunk.toolCalls) {
      pendingToolCalls = this.mergeToolCalls(pendingToolCalls, chunk.toolCalls)
    }
  }
  
  // 处理工具调用
  if (pendingToolCalls.length > 0) {
    yield { type: 'tool_start', data: pendingToolCalls }
    
    const results = await this.executeTools(pendingToolCalls)
    yield { type: 'tool_end', data: results }
    
    // 继续对话...
  }
  
  yield { type: 'done', data: fullContent }
}
```

## 错误处理

```javascript
async chat(message, options = {}) {
  try {
    return await this._chat(message, options)
  } catch (error) {
    if (error.status === 429) {
      // 限流，切换渠道或重试
      return await this.retryWithBackoff(message, options)
    }
    
    if (error.status === 401) {
      throw new AuthError('API 认证失败')
    }
    
    throw error
  }
}

async retryWithBackoff(message, options, attempt = 1) {
  const maxAttempts = 3
  const delay = Math.pow(2, attempt) * 1000
  
  if (attempt > maxAttempts) {
    throw new Error('重试次数已达上限')
  }
  
  await sleep(delay)
  
  try {
    return await this._chat(message, options)
  } catch (error) {
    return await this.retryWithBackoff(message, options, attempt + 1)
  }
}
```

## 下一步

- [Web 服务](./web-server) - HTTP API 服务
- [存储系统](./storage) - 数据持久化
