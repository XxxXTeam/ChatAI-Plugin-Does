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
  model: claude-3-5-sonnet-20241022
  provider: claude
```

```yaml [DeepSeek]
- name: deepseek
  baseUrl: https://api.deepseek.com
  apiKey: ${DEEPSEEK_API_KEY}
  model: deepseek-chat
```

```yaml [Gemini]
- name: gemini
  baseUrl: https://generativelanguage.googleapis.com
  apiKey: ${GOOGLE_API_KEY}
  model: gemini-pro
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
