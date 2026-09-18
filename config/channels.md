# 渠道配置

渠道是连接 AI 模型的配置单元。本文对照 config 默认配置（`config/config.js` 的 `getDefaultConfig()`，对应提交 `5351e7d7`）中 `channels` 数组元素的注释结构编写；历史上在本页出现过的 `type` / `model` / `maxRetries` / `retryDelay` / `retryBackoff` / `retryOn` / `headers` / `proxy` 等渠道顶层字段在代码中不存在，已按源码更正（见文末说明）。

## 渠道顶层字段 {#fields}

`config` 顶层 `channels: []` 是渠道数组，每个渠道的字段如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 渠道 ID（唯一标识） |
| `name` | string | 渠道名称 |
| `adapterType` | string | 适配器类型：`'openai'` / `'claude'` / `'gemini'` |
| `baseUrl` | string | 单个 Base URL（兼容旧格式） |
| `baseUrls` | string[] | 多个 Base URL 数组（支持自动选择最优延迟）；第一个不可用时自动切换下一个 |
| `baseUrlLatencies` | object | Base URL 延迟测试结果，格式 `{ "url": latency(ms) }` |
| `selectedBaseUrlIndex` | number | 当前选中的 Base URL 索引 |
| `apiKey` | string | API 密钥 |
| `apiKeys` | array | 多 API Key 配置（支持轮询策略，见下） |
| `strategy` | string | API Key 轮询策略：`'round-robin'` / `'random'` / `'weighted'` / `'least-used'` / `'failover'`（见下方「API Key 轮询策略」） |
| `models` | string[] | 支持的模型列表 |
| `enabled` | boolean | 是否启用 |
| `priority` | number | 优先级（数字越小优先级越高） |
| `weight` | number | 负载均衡权重（1-100） |

渠道级超时、重试、配额等对象配置（`timeout` / `retry` / `quota` / `auth` / `imageConfig` / `experimental` / `overrides` / `advanced` / `systemPromptConfig`）见 [渠道高级配置](./channels-advanced)。

### API Key 轮询策略 {#key-strategy}

`ChannelManager` 中定义了 `KeyStrategy`（`src/services/llm/ChannelManager.js`）：

| 枚举值 | 含义 |
| --- | --- |
| `'round-robin'` | 轮询（默认，缺省时回退到该策略） |
| `'random'` | 随机 |
| `'weighted'` | 按权重随机 |
| `'least-used'` | 最少使用优先 |
| `'failover'` | 故障转移（按顺序，失败后换下一个） |

多渠道负载均衡由独立的 [loadBalancing 配置](./shared-advanced#loadbalancing) 控制。

### 渠道状态 status

| 枚举值 | 含义 |
| --- | --- |
| `'idle'` | 空闲 |
| `'active'` | 活跃 |
| `'error'` | 错误 |
| `'disabled'` | 禁用 |
| `'quota_exceeded'` | 配额耗尽 |

## 渠道示例

```yaml
channels:
  - id: my-openai
    name: openai-main
    adapterType: openai
    baseUrl: https://api.openai.com/v1
    baseUrls:
      - https://api.openai.com/v1
      - https://api-backup.example.com/v1
    baseUrlLatencies: {}
    selectedBaseUrlIndex: 0
    apiKey: sk-xxx
    apiKeys: []
    strategy: round-robin
    models:
      - gpt-4o
      - gpt-4o-mini
    enabled: true
    priority: 100
    weight: 100
    chatPath: ''
    modelsPath: ''
    endpoints:
      chat: ''
      models: ''
      embeddings: ''
      images: ''
    customHeaders: {}
    headersTemplate: ""
    requestBodyTemplate: ""
    systemPromptConfig: null
    auth:
      type: bearer
      headerName: ""
      prefix: ""
    imageConfig:
      transferMode: auto
      convertFormat: true
      targetFormat: auto
      compress: true
      quality: 85
      maxSize: 4096
      processAnimated: true
    experimental:
      supportsReasoningParams: false
      ws:
        enabled: false
        url: ""
    timeout:
      connect: 10000
      read: 60000
    retry:
      maxAttempts: 3
      delay: 1000
      backoff: exponential
    quota:
      daily: 0
      hourly: 0
      perMinute: 0
    overrides:
      disableTemperature: false
      modelTemperatures: null
      modelMapping: {}
      systemPromptPrefix: ""
      systemPromptSuffix: ""
    advanced:
      streaming:
        enabled: true
        chunkSize: 1024
      thinking:
        enableReasoning: false
        defaultLevel: medium
        adaptThinking: true
        sendThinkingAsMessage: false
        vendorThinkingControl: auto
      llm:
        temperature: 0.7
        maxTokens: 4000
        topP: 1
        frequencyPenalty: 0
        presencePenalty: 0
        maxCharacters: 0
    status: active
    lastHealthCheck: null
    testedAt: null
    errorCount: 0
    lastErrorTime: null
```

适配器类型示例说明：

- `openai`：OpenAI 兼容 API，包括官方 API 和各类中转服务，接入时主要调整 `baseUrl` 与 `apiKey`。
- `claude`：Anthropic Claude API。
- `gemini`：Google Gemini API。

::: warning 免费渠道说明
`config.yaml` 实例中可能包含预配置渠道（包括免费/演示渠道），这些渠道随时可能停止服务、限流或变更，不保证可用性与稳定性。如需稳定使用，请自行申请 API Key 后配置专用渠道。
:::

## 渠道启用与模型列表 {#enabled-list}

- 设置 `enabled: false` 的渠道会被排除：后端聚合接口（群管理面板模型列表）与前端各处模型下拉（全局配置、群编辑器、用户页、绘图页等）均过滤禁用渠道，其模型不再出现在可用模型列表中。
- 渠道模型映射（`getActualModel`）在 ChatService 主路径与 LlmDelegate 旁路调用中口径一致。
- 修改渠道后建议在面板执行「测试连接」验证连通性（面板测试入口为渠道编辑页的测试按钮）。

## 错误重试与备选模型 {#fallback}

### 备选模型配置（llm.fallback）

主模型失败时按优先级轮询备选模型：

```yaml
llm:
  fallback:
    enabled: true            # 启用备选模型轮询
    models: []               # 备选模型列表，按优先级排序
    maxRetries: 3            # 最大重试次数
    retryDelay: 500          # 重试间隔(ms)
    notifyOnFallback: false  # 切换模型时是否通知用户
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `true` | 启用备选模型轮询 |
| `models` | array | `[]` | 备选模型列表（按优先级排序） |
| `maxRetries` | number | `3` | 最大重试次数 |
| `retryDelay` | number | `500` | 重试间隔（ms） |
| `notifyOnFallback` | boolean | `false` | 切换模型时是否通知用户 |

可选键 `enableChannelSwitch`（默认配置中无该字段）：`LlmDelegate` 与 `ChatService` 以 `fallback.enableChannelSwitch !== false` 判断，即只要不显式写为 `false` 便允许旁路调用切换渠道（源码 `src/services/llm/LlmDelegate.js`、`src/services/llm/ChatService.js`）。

::: tip LlmDelegate 旁路重试
记忆、知识图谱、上下文总结等旁路 LLM 调用通过 `callWithChannelDelegate` 统一走渠道切换/指数退避重试（初始间隔 `retryDelay`，封顶 10 秒），错误上报渠道冷却，且遵循各渠道 `advanced.streaming` 配置。`enableChannelSwitch: false` 时旁路调用不再切换渠道。
:::

### 渠道级重试 retry

渠道自身的重试配置为 `retry` 对象，结构见 [渠道高级配置：重试配置](./channels-advanced)。渠道**没有**顶层 `maxRetries` / `retryDelay` / `retryBackoff` / `retryOn` 字段，历史文档中的对应写法已更正删除。

错误重试行为说明（据 `ChannelManager` 与 `LlmDelegate` 实现）：

- 渠道失败会进入渠道冷却与错误计数（`errorCount` / `lastErrorTime`）。
- 旁路调用按指数退避重试（封顶 10 秒），并可在渠道间切换（受 `llm.fallback.enableChannelSwitch` 控制）。

## 环境变量

渠道密钥可通过 `${VAR}` 形式引用环境变量吗？**未核实到源码中的展开逻辑**，本页不对此作任何保证。请直接将密钥写入 `apiKey` / `apiKeys`，或使用配置面板的密钥管理。

## 多渠道选择（loadBalancing）

多渠道场景下，`loadBalancing.strategy` 控制选择策略，支持 `'priority'` / `'round-robin'` / `'random'` / `'least-connection'`，见 [思考 / 渲染 / 输出优化配置](./shared-advanced#负载均衡-loadbalancing)。

## 下一步

- [渠道高级配置](./channels-advanced) - 端点、图片、超时、重试、配额、参数覆盖
- [模型配置](./models) - 模型选择与参数调优
- [代理配置](./proxy) - 渠道 API 请求的代理 profile
- [思考 / 渲染 / 输出优化配置](./shared-advanced) - 渠道调度相关的全局配置