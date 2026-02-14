# 渠道配置

渠道是连接 AI 模型的配置单元，本文档详细说明渠道配置选项。

## Web 面板配置

推荐使用 Web 管理面板进行渠道配置，提供可视化界面：

![渠道管理](/images/image10.png)

### 添加/编辑渠道

点击「添加渠道」或编辑现有渠道：

![编辑渠道](/images/image12.png)

### 高级配置

展开高级设置配置更多选项：

![高级配置](/images/image13.png)

### LLM 参数

配置模型生成参数：

![LLM参数](/images/image14.png)

## 配置文件

也可以直接编辑配置文件 `config/config.yaml`：

## 配置结构

```yaml
channels:
  - name: default
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    enabled: true
```

## 配置参数

### 必需参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | string | 渠道名称（唯一标识） |
| `apiKey` | string | API 密钥 |
| `model` | string | 默认模型 |

### 可选参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | string | `openai` | 渠道类型 |
| `baseUrl` | string | - | API 端点 |
| `enabled` | boolean | `true` | 是否启用 |
| `weight` | number | `1` | 负载均衡权重 |
| `priority` | number | `1` | 故障转移优先级 |
| `timeout` | number | `60000` | 超时时间（毫秒） |
| `maxRetries` | number | `3` | 最大重试次数 |

## 渠道类型

### openai

OpenAI 兼容 API，包括官方 API 和各类中转服务：

```yaml
channels:
  - name: openai
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
```

### claude

Anthropic Claude API：

```yaml
channels:
  - name: claude
    type: claude
    apiKey: sk-ant-api03-xxx
    model: claude-3-5-sonnet-20241022
```

### gemini

Google Gemini API：

```yaml
channels:
  - name: gemini
    type: gemini
    apiKey: AIzaSyxxx
    model: gemini-2.0-flash
```

## 内置免费渠道 {#free-channels}

::: warning 免费渠道说明
插件可能预配置了一些免费/演示渠道（如免费 Gemini、GLM 等），这些渠道由逆向服务提供：
- **不保证可用性**：免费渠道随时可能停止服务、限流或变更
- **不保证稳定性**：响应速度和质量可能不稳定
:::

如需稳定使用，请参考下方提供商列表申请自己的 API Key。

## 支持的 API 提供商 {#providers}

### 国际厂商

| 服务 | baseUrl | 特性 |
|------|---------|------|
| **OpenAI** | `https://api.openai.com/v1` | 对话、视觉、工具、嵌入、语音 |
| **Anthropic Claude** | `https://api.anthropic.com` | 对话、视觉、工具、思维链 |
| **Google Gemini** | `https://generativelanguage.googleapis.com` | 对话、视觉、工具、搜索增强 |
| **xAI Grok** | `https://api.x.ai/v1` | 对话、工具 |
| **Mistral AI** | `https://api.mistral.ai/v1` | 对话、嵌入、工具 |
| **Groq** | `https://api.groq.com/openai/v1` | 对话、工具（超快推理） |

### 国内厂商

| 服务 | baseUrl | 特性 |
|------|---------|------|
| **DeepSeek** | `https://api.deepseek.com/v1` | 对话、工具、推理 |
| **智谱 AI** | `https://open.bigmodel.cn/api/paas/v4` | 对话、视觉、工具、嵌入 |
| **通义千问** | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 对话、视觉、工具、嵌入 |
| **Moonshot Kimi** | `https://api.moonshot.cn/v1` | 对话、工具、文件 |
| **MiniMax** | `https://api.minimax.chat/v1` | 对话、工具、TTS |
| **零一万物** | `https://api.lingyiwanwu.com/v1` | 对话、视觉、工具 |
| **百川智能** | `https://api.baichuan-ai.com/v1` | 对话、工具 |

### 中转/聚合服务

| 服务 | baseUrl | 说明 |
|------|---------|------|
| **OpenRouter** | `https://openrouter.ai/api/v1` | 聚合多家模型，统一接口 |
| **硅基流动** | `https://api.siliconflow.cn/v1` | 国内聚合平台 |
| **Together AI** | `https://api.together.xyz/v1` | 开源模型托管 |

::: tip 兼容性说明
大部分 OpenAI 兼容 API 都可以直接使用 `openai` 类型接入，只需修改 `baseUrl` 和 `apiKey`。
:::

## 负载均衡

配置多个渠道实现负载均衡：

```yaml
channels:
  - name: primary
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    weight: 3
    
  - name: secondary
    baseUrl: https://api.deepseek.com/v1
    apiKey: sk-xxx
    model: deepseek-chat
    weight: 1
```

请求会按权重比例分配：
- primary: 75% (3/4)
- secondary: 25% (1/4)

## 故障转移

```yaml
channels:
  - name: primary
    apiKey: sk-xxx
    model: gpt-4o
    priority: 1  # 最高优先级
    
  - name: backup
    apiKey: sk-xxx
    model: deepseek-chat
    priority: 2  # 备用
```

当高优先级渠道失败时，自动切换到低优先级渠道。

## 错误重试配置

### 重试参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxRetries` | number | `3` | 最大重试次数 |
| `retryDelay` | number | `1000` | 初始重试延迟（毫秒） |
| `retryBackoff` | number | `2` | 退避系数（指数增长） |
| `timeout` | number | `60000` | 请求超时时间（毫秒） |
| `retryOn` | array | 见下文 | 触发重试的错误类型 |

### 完整配置示例

```yaml
channels:
  - name: openai
    type: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o
    
    # 重试配置
    maxRetries: 3          # 最多重试 3 次
    retryDelay: 1000       # 首次重试等待 1 秒
    retryBackoff: 2        # 每次重试等待时间翻倍
    timeout: 60000         # 60 秒超时
    
    # 触发重试的错误码
    retryOn:
      - 429   # 限流
      - 500   # 服务器错误
      - 502   # 网关错误
      - 503   # 服务不可用
      - 504   # 网关超时
```

### 重试策略

```
请求失败
    │
    ├─ 429 限流 ───────────► 指数退避重试
    │                        等待 retryDelay × retryBackoff^n 毫秒
    │
    ├─ 500/502/503/504 ───► 立即重试（带延迟）
    │   服务器错误            尝试 maxRetries 次
    │
    ├─ 401/403 ────────────► 不重试
    │   认证/权限错误          直接报错，提示检查 API Key
    │
    ├─ 网络错误 ───────────► 切换渠道
    │   (ECONNREFUSED等)     尝试其他可用渠道
    │
    └─ 超时 ───────────────► 重试或切换渠道
```

### 禁用重试

```yaml
channels:
  - name: no-retry
    apiKey: sk-xxx
    model: gpt-4o
    maxRetries: 0  # 禁用重试
```

### 自定义重试条件

```yaml
channels:
  - name: custom-retry
    apiKey: sk-xxx
    model: gpt-4o
    retryOn:
      - 429
      - 503
    # 只在 429 和 503 时重试，其他错误直接失败
```

## 代理配置

为渠道配置代理：

```yaml
channels:
  - name: openai
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    proxy:
      type: http
      host: 127.0.0.1
      port: 7890
```

或使用全局代理：

```yaml
proxy:
  enabled: true
  type: http
  host: 127.0.0.1
  port: 7890

channels:
  - name: openai
    useProxy: true  # 使用全局代理
```

## 请求头配置

```yaml
channels:
  - name: custom
    baseUrl: https://api.example.com/v1
    apiKey: xxx
    headers:
      X-Custom-Header: value
      Authorization: Bearer xxx
```

## 环境变量

使用环境变量保护敏感信息：

```yaml
channels:
  - name: openai
    apiKey: ${OPENAI_API_KEY}
```

设置环境变量：

```bash
export OPENAI_API_KEY=sk-xxx
```

## 测试渠道

### 命令测试

```
#测试渠道 openai
```

### Web 面板测试

渠道配置页面 → 点击「测试连接」

## 下一步

- [模型配置](./models) - 模型参数调优
- [代理配置](./proxy) - 网络代理设置
