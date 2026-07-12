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

## 上下文压缩配置

当对话上下文达到阈值时，系统会自动压缩对话并重载 skills（由 `ContextManager` 实现）。

::: warning 这些是可选配置项
以下压缩相关字段**默认不存在于 `config/config.yaml`**，如需自定义需手动添加到 `context` 段。
未配置时，系统使用 `ContextManager.getContextConfig()` 中定义的内置默认值（见下表）。
:::

### 触发条件

压缩是否触发由 `maxTokens` 与 `maxMessages` 共同决定（源码 `ContextManager.checkAndCompress()`）：

- 当 `maxTokens > 0` 时：估算当前消息 token 数，超过 `maxTokens × compressionThreshold` 即触发压缩。
- 当 `maxTokens` 未配置或为 `0` 时：跳过 token 判断，改用消息数判断——非 system 消息数超过 `maxMessages` 即触发。

> `maxTokens`、`maxMessages` 复用 [基础配置](#基础配置) 中的同名字段，无需重复定义。

### 可选配置项与默认值

```yaml
context:
  # 压缩触发阈值（0-1，达到 maxTokens 的百分比时触发），默认 0.8
  compressionThreshold: 0.8

  # 压缩策略，默认 summarize
  # - summarize: 使用 AI 总结旧消息（推荐）
  # - truncate: 直接截断旧消息
  # - sliding-window: 滑动窗口保留最近消息
  compressionStrategy: summarize

  # 压缩时保留系统提示，默认 true
  preserveSystemPrompt: true

  # 压缩时保留最近消息数，默认 4
  preserveRecentMessages: 4

  # 压缩后自动重载 skills 注入，默认 true
  autoReloadSkills: true
```

### 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `compressionThreshold` | number | `0.8` | 触发压缩的阈值比例（相对 `maxTokens`）|
| `compressionStrategy` | string | `summarize` | 压缩策略 |
| `preserveSystemPrompt` | boolean | `true` | 保留 system prompt（设为 `false` 才关闭）|
| `preserveRecentMessages` | number | `4` | 压缩时保留的最近消息数 |
| `autoReloadSkills` | boolean | `true` | 压缩后重载 skills（设为 `false` 才关闭）|

> 说明：`preserveSystemPrompt` 与 `autoReloadSkills` 在源码中以 `!== false` 判断，即只要不显式写为 `false` 一律视为启用。

### 完整配置示例

以下示例展示了在 `context` 段中同时启用压缩所需的全部字段（含复用的 `maxTokens`）：

```yaml
context:
  maxMessages: 20
  maxTokens: 8000            # 必须 > 0 才会启用 token 阈值压缩
  compressionThreshold: 0.8
  compressionStrategy: summarize
  preserveSystemPrompt: true
  preserveRecentMessages: 4
  autoReloadSkills: true
```

### 压缩策略说明

- **summarize**: 使用 LLM 对旧消息生成摘要，保留关键信息，适合长对话
- **truncate**: 直接丢弃超出部分的消息，简单但可能丢失重要上下文
- **sliding-window**: 保留最近 N 条消息，自动滑动窗口

### Skills 自动重注入

压缩后系统会自动:
1. 检测当前会话已加载的 skills
2. 重新将 skills 指令注入到 system prompt
3. 确保 AI 在压缩后仍然具备技能上下文
