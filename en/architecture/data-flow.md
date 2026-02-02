# Data Flow <Badge type="info" text="Architecture" />

How requests flow through the ChatAI Plugin system.

## Request Flow Overview {#overview}

```mermaid
sequenceDiagram
    participant U as User
    participant Y as Yunzai-Bot
    participant C as ChatListener
    participant S as ChatService
    participant A as SkillsAgent
    participant L as LLM Client
    participant M as McpManager

    U->>Y: Send Message
    Y->>C: Message Event
    C->>C: Check Trigger
    C->>S: Process Message
    S->>L: Send to LLM
    L-->>S: Response (with tool calls)
    S->>A: Execute Tools
    A->>M: Call Tools
    M-->>A: Tool Results
    A-->>S: Results
    S->>L: Continue with results
    L-->>S: Final Response
    S-->>C: Reply
    C-->>Y: Send Message
    Y-->>U: Display
```

## Message Processing {#message-processing}

### 1. Message Reception {#step-1}

```javascript
// apps/chat.js
async accept(e) {
  // Check if message should trigger AI
  if (!this.shouldTrigger(e)) return false
  
  // Process message
  await this.processMessage(e)
}
```

### 2. Trigger Check {#step-2}

```mermaid
flowchart TD
    A[Message] --> B{Private Chat?}
    B -->|Yes| C{Private Trigger?}
    B -->|No| D{Group Trigger?}
    C -->|Match| E[Process]
    C -->|No Match| F[Ignore]
    D -->|Match| E
    D -->|No Match| F
```

### 3. Context Building {#step-3}

```javascript
// Build conversation context
const context = await contextService.getContext(userId, groupId)

// Add system prompt
const messages = [
  { role: 'system', content: preset.systemPrompt },
  ...context.messages,
  { role: 'user', content: userMessage }
]
```

### 4. LLM Request {#step-4}

```javascript
// Send to LLM with tools
const response = await llmClient.sendMessage(messages, {
  tools: availableTools,
  temperature: config.temperature,
  maxTokens: config.maxTokens
})
```

### 5. Tool Execution {#step-5}

```mermaid
flowchart TD
    A[LLM Response] --> B{Has Tool Calls?}
    B -->|No| C[Return Text]
    B -->|Yes| D[Execute Tools]
    D --> E[Collect Results]
    E --> F[Send to LLM]
    F --> B
```

### 6. Response Delivery {#step-6}

```javascript
// Format and send response
const reply = formatResponse(response)
await e.reply(reply)

// Save to context
await contextService.addMessage(userId, groupId, {
  role: 'assistant',
  content: response.text
})
```

## Tool Call Flow {#tool-flow}

```mermaid
sequenceDiagram
    participant S as ChatService
    participant A as SkillsAgent
    participant M as McpManager
    participant B as BuiltinServer
    participant T as Tool

    S->>A: executeSkill(name, args)
    A->>A: Check Permission
    A->>A: Inject Parameters
    A->>M: callTool(name, args)
    M->>B: route to source
    B->>T: execute handler
    T-->>B: result
    B-->>M: result
    M-->>A: result
    A-->>S: formatted result
```

## Memory Flow {#memory-flow}

```mermaid
flowchart LR
    A[Conversation] --> B[Memory Extraction]
    B --> C[Vector Embedding]
    C --> D[Store in DB]
    
    E[New Message] --> F[Query Relevant]
    F --> G[Inject to Context]
    G --> H[LLM Request]
```

## Error Handling {#errors}

```mermaid
flowchart TD
    A[Request] --> B{Success?}
    B -->|Yes| C[Return Response]
    B -->|No| D{Retryable?}
    D -->|Yes| E[Retry with Backoff]
    E --> B
    D -->|No| F{Failover Available?}
    F -->|Yes| G[Switch Channel]
    G --> B
    F -->|No| H[Return Error]
```

## Next Steps {#next}

- [LLM Adapters](./adapters) - Model integration
- [MCP System](./mcp) - Tool protocol
