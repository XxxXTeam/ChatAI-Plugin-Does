# 上下文配置

上下文管理控制 AI 的对话记忆和历史消息处理。本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）。

## 基础配置 {#base}

```yaml
context:
  maxMessages: 20                  # 最大消息数
  maxTokens: 4000                  # 最大 Token 数
  cleaningStrategy: 'auto'         # 'auto' | 'manual'
  isolation:                       # 隔离模式配置
    groupUserIsolation: false      # 群聊用户隔离（false=群共享上下文, true=每用户独立）
    privateIsolation: true         # 私聊隔离（每用户独立上下文）
  autoContext:                     # 自动上下文配置
    enabled: true                  # 启用自动上下文
    maxHistoryMessages: 20         # 携带的历史消息数量
    includeToolCalls: false        # 是否包含工具调用记录
  autoEnd:                         # 定量自动结束对话
    enabled: false                 # 是否启用自动结束
    maxRounds: 50                  # 最大对话轮数（用户+AI各算1轮）
    notifyUser: true               # 结束时是否通知用户
    notifyMessage: '对话已达到最大轮数限制，已自动开始新会话。'
  groupContextSharing: true        # 群聊上下文传递
  globalSystemPrompt: ''           # 全局系统提示词
  globalPromptMode: 'append'       # 全局提示词模式: append(追加) | prepend(前置) | override(覆盖)
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxMessages` | number | `20` | 保留的最大消息数 |
| `maxTokens` | number | `4000` | 最大 Token 数 |
| `cleaningStrategy` | string | `'auto'` | 清理策略，默认注释枚举为 `'auto'` / `'manual'`（见下方代码事实说明） |
| `isolation.groupUserIsolation` | boolean | `false` | 群聊用户隔离（`false`=群共享上下文，`true`=每用户独立） |
| `isolation.privateIsolation` | boolean | `true` | 私聊隔离（每用户独立上下文） |
| `autoContext.enabled` | boolean | `true` | 启用自动上下文 |
| `autoContext.maxHistoryMessages` | number | `20` | 携带的历史消息数量 |
| `autoContext.includeToolCalls` | boolean | `false` | 是否包含工具调用记录 |
| `autoEnd.enabled` | boolean | `false` | 是否启用自动结束 |
| `autoEnd.maxRounds` | number | `50` | 最大对话轮数（用户 + AI 各算 1 轮） |
| `autoEnd.notifyUser` | boolean | `true` | 结束时是否通知用户 |
| `autoEnd.notifyMessage` | string | `'对话已达到最大轮数限制，已自动开始新会话。'` | 自动结束时的通知文案 |
| `groupContextSharing` | boolean | `true` | 群聊上下文传递 |
| `globalSystemPrompt` | string | `''` | 全局系统提示词 |
| `globalPromptMode` | string | `'append'` | `append`(追加) / `prepend`(前置) / `override`(覆盖) |

::: warning cleaningStrategy 的代码事实
默认配置注释写的是 `'auto' | 'manual'`，但 `src/services/llm/ContextManager.js` 的 `cleanContext` 实际按 `config.get('context.cleaningStrategy') || 'truncate'` 读取，且仅对 `'smart'` 分支有特殊处理，其余值一律落入「默认/回退：简单截断」。本页旧版及部分历史页面书写的 `sliding` / `summarize` / `none` 枚举与「智能保留重要消息」的联动描述与实际代码不符，已删除。
:::

## 自动摘要配置 {#auto-summarize}

```yaml
context:
  autoSummarize:
    enabled: true                   # 启用自动摘要
    intervalMinutes: 10             # 检查间隔（分钟）
    maxMessagesBefore: 60           # 超过此消息数且长时间未活跃则总结
    minInactiveMinutes: 30          # 在该时间段无人发言才会总结
    retainMessagesAfterSummary: 5   # 总结后保留的最近消息数量
    model: ''                       # 为空使用默认模型
    maxTokens: 400                  # 总结输出长度
    windowMessages: 80              # 参与总结的最多消息数
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `true` | 启用自动摘要 |
| `intervalMinutes` | number | `10` | 检查间隔（分钟） |
| `maxMessagesBefore` | number | `60` | 超过此消息数且长时间未活跃则总结 |
| `minInactiveMinutes` | number | `30` | 在该时间段无人发言才会总结 |
| `retainMessagesAfterSummary` | number | `5` | 总结后保留的最近消息数量 |
| `model` | string | `''` | 摘要使用的模型，为空使用默认模型 |
| `maxTokens` | number | `400` | 总结输出长度 |
| `windowMessages` | number | `80` | 参与总结的最多消息数 |

## 上下文压缩配置 {#compression}

当对话上下文达到阈值时，系统会自动压缩对话；压缩相关字段通过 `ContextManager.getContextConfig()` 读取（`src/services/llm/ContextManager.js`）。

::: warning 这些是可选配置项
以下压缩相关字段默认使用 `getContextConfig()` 的内置回退值，按需手动添加到 `context` 段即可：
:::

```yaml
context:
  # 压缩触发阈值（0-1，达到 maxTokens 的百分比时触发），回退默认 0.8
  compressionThreshold: 0.8

  # 压缩策略，回退默认 summarize
  # - summarize: 使用 AI 总结旧消息（推荐）
  # - truncate: 直接截断旧消息
  # - sliding-window: 滑动窗口保留最近消息
  compressionStrategy: summarize

  # 压缩时保留系统提示，回退默认 true
  preserveSystemPrompt: true

  # 压缩时保留最近消息数，回退默认 4
  preserveRecentMessages: 4

  # 压缩后自动重载 skills 注入，回退默认 true
  autoReloadSkills: true
```

| 参数 | 类型 | 回退默认值 | 说明 |
|------|------|-----------|------|
| `compressionThreshold` | number | `0.8` | 触发压缩的阈值比例（相对 `maxTokens`） |
| `compressionStrategy` | string | `'summarize'` | 压缩策略：`summarize` / `truncate` / `sliding-window`（源码 `compressMessages` 的 switch 分支，未匹配时回退 summarize） |
| `preserveSystemPrompt` | boolean | `true` | 压缩时保留系统提示（源码以 `!== false` 判断） |
| `preserveRecentMessages` | number | `4` | 压缩时保留的最近消息数 |
| `autoReloadSkills` | boolean | `true` | 压缩后自动重载 skills 注入 |

### 触发条件

压缩是否触发由 `checkAndCompress` 决定（源码 `ContextManager`）：

- 当 `maxTokens > 0` 时：估算当前消息 token 数，超过 `maxTokens × compressionThreshold` 即触发压缩。
- 当 `maxTokens` 未配置或为 `0` 时：跳过 token 判断，改用消息数判断——非 system 消息数超过 `maxMessages` 即触发。

`maxTokens`、`maxMessages` 即 [基础配置](#base) 中的同名字段，无需重复定义。

## 完整示例

```
context:
  maxMessages: 20
  maxTokens: 8000
  cleaningStrategy: auto

  autoSummarize:
    enabled: true
    intervalMinutes: 10
    maxMessagesBefore: 60
    minInactiveMinutes: 30
    retainMessagesAfterSummary: 5
    model: ""
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
    notifyMessage: "对话已达到最大轮数限制，已自动开始新会话。"

  groupContextSharing: true
  globalSystemPrompt: ""
  globalPromptMode: append

  compressionThreshold: 0.8
  compressionStrategy: summarize
  preserveSystemPrompt: true
  preserveRecentMessages: 4
  autoReloadSkills: true
```

## 手动管理

### 结束对话

```
#ai结束对话
```

"`#ai查看对话`"该命令未在 `apps/Commands.js` 的命令注册中找到，未核实存在，请勿引用。

## 下一步

- [记忆配置](./memory) - 长期记忆系统
- [MCP 配置](./mcp) - MCP 服务器配置