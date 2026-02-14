# Channel Configuration <Badge type="tip" text="API" />

Configure API channels for AI model access.

## Channel Structure {#structure}

```yaml
channels:
  - name: openai-main        # Unique name
    baseUrl: https://api.openai.com/v1
    apiKey: ${OPENAI_API_KEY}
    model: gpt-4o
    priority: 1              # Lower = higher priority
    enabled: true
```

## Required Fields {#required}

| Field | Type | Description |
|:------|:-----|:------------|
| `name` | string | Unique channel identifier |
| `baseUrl` | string | API endpoint URL |
| `apiKey` | string | API key (supports env vars) |
| `model` | string | Default model name |

## Optional Fields {#optional}

| Field | Type | Default | Description |
|:------|:-----|:--------|:------------|
| `priority` | number | `1` | Channel priority |
| `enabled` | boolean | `true` | Enable/disable |
| `maxTokens` | number | `4096` | Max output tokens |
| `temperature` | number | `0.7` | Response creativity |
| `timeout` | number | `60000` | Request timeout (ms) |

## Built-in Free Channels {#free-channels}

::: warning Free Channel Notice
The plugin may come with pre-configured free/demo channels (e.g. free Gemini, GLM). These are provided by third-party relay services:
- **No availability guarantee**: Free channels may stop, throttle, or change at any time
- **No stability guarantee**: Response speed and quality may be unstable
- **For trial use only**: Configure your own API Key for stable service
- **Security note**: Data may pass through third parties; do not send sensitive information
:::

## Supported Providers {#providers}

### International

| Provider | baseUrl | Features |
|----------|---------|----------|
| **OpenAI** | `https://api.openai.com/v1` | Chat, vision, tools, embedding, audio |
| **Anthropic Claude** | `https://api.anthropic.com` | Chat, vision, tools, thinking |
| **Google Gemini** | `https://generativelanguage.googleapis.com` | Chat, vision, tools, grounding |
| **xAI Grok** | `https://api.x.ai/v1` | Chat, tools |
| **Mistral AI** | `https://api.mistral.ai/v1` | Chat, embedding, tools |
| **Groq** | `https://api.groq.com/openai/v1` | Chat, tools (ultra-fast) |

### Chinese Providers

| Provider | baseUrl | Features |
|----------|---------|----------|
| **DeepSeek** | `https://api.deepseek.com/v1` | Chat, tools, reasoning |
| **Zhipu AI** | `https://open.bigmodel.cn/api/paas/v4` | Chat, vision, tools, embedding |
| **Qwen** | `https://dashscope.aliyuncs.com/compatible-mode/v1` | Chat, vision, tools, embedding |
| **Moonshot Kimi** | `https://api.moonshot.cn/v1` | Chat, tools, file |

### Relay/Aggregation

| Provider | baseUrl | Description |
|----------|---------|-------------|
| **OpenRouter** | `https://openrouter.ai/api/v1` | Multi-model aggregation |
| **SiliconFlow** | `https://api.siliconflow.cn/v1` | Chinese aggregation platform |
| **Together AI** | `https://api.together.xyz/v1` | Open-source model hosting |

::: tip Compatibility
Most OpenAI-compatible APIs can be connected using the `openai` type — just change `baseUrl` and `apiKey`.
:::

## Provider Examples {#examples}

::: code-group
```yaml [OpenAI]
- name: openai
  baseUrl: https://api.openai.com/v1
  apiKey: ${OPENAI_API_KEY}
  model: gpt-4o
```

```yaml [Claude]
- name: claude
  baseUrl: https://api.anthropic.com
  apiKey: ${ANTHROPIC_API_KEY}
  model: claude-sonnet-4-20250514
  provider: claude
```

```yaml [DeepSeek]
- name: deepseek
  baseUrl: https://api.deepseek.com/v1
  apiKey: ${DEEPSEEK_API_KEY}
  model: deepseek-chat
```

```yaml [Gemini]
- name: gemini
  baseUrl: https://generativelanguage.googleapis.com
  apiKey: ${GOOGLE_API_KEY}
  model: gemini-2.5-flash
  provider: gemini
```
:::

## Load Balancing {#load-balancing}

```yaml
channelStrategy:
  mode: priority      # priority, round-robin, random
  failover: true      # Auto switch on failure
  maxRetries: 3       # Retry attempts
  retryDelay: 1000    # Delay between retries (ms)
```

## Environment Variables {#env-vars}

::: tip Security
Use environment variables for API keys:
```yaml
apiKey: ${OPENAI_API_KEY}
```
:::

Set in system or `.env` file:
```bash
export OPENAI_API_KEY=sk-xxx
export ANTHROPIC_API_KEY=sk-ant-xxx
```

## Testing Channels {#testing}

### Via Web Panel {#web-test}
1. Go to **Channels** tab
2. Click **Test Connection**

### Via Command {#cmd-test}
```txt
#ai测试渠道 openai
```

## Next Steps {#next}

- [Models](./models) - Model parameters
- [Proxy](./proxy) - Proxy configuration
