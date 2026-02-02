# 上下文配置

上下文管理控制 AI 的对话记忆和历史消息处理。

## 基础配置

```yaml
context:
  # 最大消息数
  maxMessages: 20
  
  # 最大 Token 数
  maxTokens: 4000
  
  # 清理策略: auto | sliding | summarize | none
  cleaningStrategy: auto
  
  # 群聊上下文共享
  groupContextSharing: true
  
  # 全局 System Prompt
  globalSystemPrompt: ""
  globalPromptMode: append  # append | prepend | replace
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxMessages` | number | 20 | 保留的最大消息数 |
| `maxTokens` | number | 4000 | 最大 Token 数 |
| `cleaningStrategy` | string | auto | 清理策略 |
| `groupContextSharing` | boolean | true | 群成员共享上下文 |

## 自动摘要配置

超出限制时，自动生成历史消息摘要：

```yaml
context:
  autoSummarize:
    enabled: true
    intervalMinutes: 10       # 检查间隔
    maxMessagesBefore: 60     # 触发摘要的消息数
    minInactiveMinutes: 30    # 最小不活跃时间
    retainMessagesAfterSummary: 0  # 摘要后保留消息数
    model: ""                 # 摘要使用的模型
    maxTokens: 400            # 摘要最大 Token
    windowMessages: 80        # 摘要窗口消息数
```

## 上下文隔离

```yaml
context:
  isolation:
    # 群内用户隔离（每个用户独立上下文）
    groupUserIsolation: false
    
    # 私聊隔离
    privateIsolation: true
```

- `groupUserIsolation: true` - 群内每个用户有独立对话
- `groupUserIsolation: false` - 群内所有用户共享对话

## 自动上下文

```yaml
context:
  autoContext:
    enabled: true
    maxHistoryMessages: 20    # 最大历史消息数
    includeToolCalls: false   # 包含工具调用记录
```

## 自动结束对话

```yaml
context:
  autoEnd:
    enabled: false
    maxRounds: 50             # 最大对话轮数
    notifyUser: true          # 通知用户
    notifyMessage: "对话已达到最大轮数限制，已自动开始新会话。"
```

## 清理策略

### auto（自动）

根据情况自动选择最佳策略：

```yaml
context:
  cleaningStrategy: auto
```

### sliding（滑动窗口）

保留最近 N 条消息，超出后删除最早的消息：

```yaml
context:
  cleaningStrategy: sliding
  maxMessages: 20
```

### summarize（摘要）

超出限制时，自动生成历史消息摘要：

```yaml
context:
  cleaningStrategy: summarize
```

### none（不清理）

不自动清理，需手动结束对话：

```yaml
context:
  cleaningStrategy: none
```

## 完整示例

```yaml
context:
  maxMessages: 20
  maxTokens: 4000
  cleaningStrategy: auto
  
  autoSummarize:
    enabled: true
    intervalMinutes: 10
    maxMessagesBefore: 60
    minInactiveMinutes: 30
    retainMessagesAfterSummary: 0
    maxTokens: 400
    windowMessages: 80
  
  isolation:
    groupUserIsolation: false
    privateIsolation: true
  
  autoContext:
    enabled: true
    maxHistoryMessages: 20
    includeToolCalls: false
  
  autoEnd:
    enabled: false
    maxRounds: 50
    notifyUser: true
  
  groupContextSharing: true
  globalSystemPrompt: ""
  globalPromptMode: append
```

## 手动管理

### 结束对话

```
#ai结束对话
```

### 查看对话

```
#ai查看对话
```

## 下一步

- [记忆配置](./memory) - 长期记忆系统
- [MCP 配置](./mcp) - MCP 服务器配置
