# 基础配置

本文档介绍插件的基础配置选项，配置文件位于 `config/config.yaml`。

## basic 基础设置

```yaml
basic:
  # 命令前缀
  commandPrefix: "#ai"
  
  # 调试模式
  debug: false
  
  # 显示思考消息
  showThinkingMessage: false
  
  # 调试信息仅输出到控制台
  debugToConsoleOnly: true
  
  # 引用回复
  quoteReply: false
  
  # 自动撤回
  autoRecall:
    enabled: false
    delay: 60          # 撤回延迟（秒）
    recallError: true  # 撤回错误消息
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `commandPrefix` | string | `#ai` | 管理命令前缀 |
| `debug` | boolean | `false` | 开启调试模式 |
| `showThinkingMessage` | boolean | `false` | 显示 AI 思考过程 |
| `debugToConsoleOnly` | boolean | `true` | 调试信息仅输出控制台 |
| `quoteReply` | boolean | `false` | 回复时引用原消息 |

## admin 管理员配置

```yaml
admin:
  # 主人QQ列表
  masterQQ: []
  
  # 插件作者QQ（拥有更高权限）
  pluginAuthorQQ: []
  
  # 登录时私聊通知主人
  loginNotifyPrivate: true
  
  # 敏感命令仅主人可用
  sensitiveCommandMasterOnly: true
```

## llm 模型配置

```yaml
llm:
  # 默认模型
  defaultModel: gpt-4o
  
  # 默认预设ID
  defaultChatPresetId: ""
  
  # 嵌入模型
  embeddingModel: text-embedding-3-small
  dimensions: 1536
  
  # 场景模型配置
  models:
    chat: ""        # 对话模型
    image: ""       # 图像理解模型
    roleplay: ""    # 角色扮演模型
    tool: ""        # 工具调用模型
    dispatch: ""    # 工具分发模型
    search: ""      # 搜索模型
    draw: ""        # 绘图模型
  
  # 回退配置
  fallback:
    enabled: true
    models: []
    maxRetries: 3
    retryDelay: 500
    notifyOnFallback: false
  
  # 模型参数
  temperature: 0.7
  maxTokens: 4000
  topP: 1
  frequencyPenalty: 0
  presencePenalty: 0
```

## web 服务配置

```yaml
web:
  # 监听端口
  port: 3000
  
  # 共享端口（TRSS）
  sharePort: false
  
  # 挂载路径
  mountPath: /chatai
  
  # JWT 密钥（自动生成）
  jwtSecret: ""
  
  # 公网URL（用于生成链接）
  publicUrl: ""
```

## redis 配置

```yaml
redis:
  enabled: true
  host: 127.0.0.1
  port: 6379
  password: ""
  db: 0
```

## images 图片配置

```yaml
images:
  storagePath: ./data/images
  maxSize: 10485760  # 10MB
  allowedFormats:
    - jpg
    - jpeg
    - png
    - gif
    - webp
```

## update 更新配置

```yaml
update:
  autoCheck: true       # 自动检查更新
  checkOnStart: true    # 启动时检查
  autoUpdate: true      # 自动更新
  autoRestart: true     # 更新后自动重启
  notifyMaster: true    # 通知主人
```

## streaming 流式输出

```yaml
streaming:
  enabled: true
  chunkSize: 1024
```

## output 输出配置

```yaml
output:
  # 长文本处理
  longText:
    enabled: true
    threshold: 500      # 字符阈值
    mode: forward       # forward | image
    forwardTitle: AI 回复
  
  # 分句输出
  sentenceOutput:
    enabled: false
    allSentences: false
    minDelay: 300
    maxDelay: 1500
    randomDelay: true
```

## render 渲染配置

```yaml
render:
  mathFormula: true    # 渲染数学公式
  theme: light         # light | dark
  width: 800           # 渲染宽度
```

## loadBalancing 负载均衡

```yaml
loadBalancing:
  strategy: priority   # priority | round-robin | random | weight
```

## thinking 思考配置

思考（推理）相关的全局配置，控制模型是否输出思考过程及推理强度。该段为全局默认值，可被预设、渠道、单次请求逐级覆盖（源码 `src/services/llm/ThinkingOptions.js` 的 `resolveThinkingOptions`，优先级：请求 > 预设 > 渠道 > 全局）。

```yaml
thinking:
  # 思考功能总开关，为 false 时强制关闭推理
  enabled: false

  # 默认推理强度: low | medium | high
  defaultLevel: low

  # 是否默认开启推理（需 enabled 不为 false 才生效）
  enableReasoning: false

  # 推理 token 预算（0 表示不限制/不单独设置）
  reasoningBudgetTokens: 0

  # 是否向用户展示思考内容
  showThinkingContent: true

  # 思考内容是否使用合并转发消息发送
  useForwardMsg: true
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `false` | 思考功能总开关。为 `false` 时无论其他项如何都强制关闭推理 |
| `defaultLevel` | string | `low` | 默认推理强度，可选 `low` / `medium` / `high` |
| `enableReasoning` | boolean | `false` | 是否默认开启推理，仅在 `enabled` 不为 `false` 时生效 |
| `reasoningBudgetTokens` | number | `0` | 推理 token 预算，仅当为正整数时生效，`0` 表示不单独限制 |
| `showThinkingContent` | boolean | `true` | 是否向用户展示模型的思考过程内容 |
| `useForwardMsg` | boolean | `true` | 展示思考内容时是否以合并转发消息发送 |

::: tip 关于 vendorThinkingControl（可选项）
源码 `resolveThinkingOptions` 还支持 `vendorThinkingControl` 字段（默认 `auto`，可选 `auto` / `off` / `glm`），用于智谱等厂商需在请求体中传 `thinking.type` 的场景。该字段默认不在 `config.yaml` 的 `thinking` 段中，如需全局设置可手动添加 `thinking.vendorThinkingControl`，也可在渠道高级配置中单独指定。
:::

::: warning enabled 与 enableReasoning 的关系
两者需配合使用：`enabled: false` 会直接短路关闭推理；只有当 `enabled` 不为 `false` 且 `enableReasoning: true`（或由预设/渠道/请求逐级覆盖为 `true`）时，才会真正开启推理。
:::

## 完整示例

```yaml
basic:
  commandPrefix: "#ai"
  debug: false
  showThinkingMessage: false
  quoteReply: false
  autoRecall:
    enabled: false
    delay: 60

admin:
  masterQQ: ["123456789"]
  loginNotifyPrivate: true
  sensitiveCommandMasterOnly: true

llm:
  defaultModel: gpt-4o
  temperature: 0.7
  maxTokens: 4000
  fallback:
    enabled: true
    maxRetries: 3

web:
  port: 3000
  sharePort: false

streaming:
  enabled: true

update:
  autoCheck: true
  autoUpdate: false
```

## 下一步

- [渠道配置](./channels) - 配置 API 渠道
- [模型配置](./models) - 模型参数调优
- [触发配置](./triggers) - 触发方式设置
