# Model Configuration <Badge type="tip" text="LLM" />

Configure AI model parameters and behavior.

## Model Selection {#selection}

```yaml
channels:
  - name: main
    model: gpt-4o           # Default model
    models:                 # Available models
      - gpt-4o
      - gpt-4o-mini
      - gpt-4-turbo
```

## Model Parameters {#parameters}

| Parameter | Type | Range | Description |
|:----------|:-----|:------|:------------|
| `temperature` | number | 0-2 | Creativity (higher = more random) |
| `maxTokens` | number | 1-128000 | Max output tokens |
| `topP` | number | 0-1 | Nucleus sampling |
| `frequencyPenalty` | number | -2 to 2 | Reduce repetition |
| `presencePenalty` | number | -2 to 2 | Encourage new topics |

```yaml
channels:
  - name: creative
    model: gpt-4o
    temperature: 1.2        # More creative
    maxTokens: 2048
    
  - name: precise
    model: gpt-4o
    temperature: 0.3        # More precise
    maxTokens: 4096
```

## Popular Models {#popular}

### OpenAI {#openai-models}

| Model | Context | Best For |
|:------|:--------|:---------|
| `gpt-4o` | 128K | General, vision |
| `gpt-4o-mini` | 128K | Fast, cheap |
| `gpt-4-turbo` | 128K | Complex tasks |
| `o1-preview` | 128K | Reasoning |

### Claude {#claude-models}

| Model | Context | Best For |
|:------|:--------|:---------|
| `claude-3-5-sonnet` | 200K | Best overall |
| `claude-3-opus` | 200K | Complex tasks |
| `claude-3-haiku` | 200K | Fast, cheap |

### Others {#other-models}

| Model | Provider | Best For |
|:------|:---------|:---------|
| `deepseek-chat` | DeepSeek | Chinese, coding |
| `gemini-pro` | Google | General |
| `qwen-turbo` | Alibaba | Chinese |

## Per-Group Models {#per-group}

```yaml
groups:
  123456789:
    channel: creative
    model: gpt-4o
  987654321:
    channel: precise
    model: gpt-4o-mini
```

## Preset Override {#preset-override}

```yaml
# data/presets/coder.yaml
name: coder
model: gpt-4o
temperature: 0.2
maxTokens: 4096
```

## Token Management {#tokens}

::: tip Token Usage
Monitor token usage in Web Panel → Statistics
:::

```yaml
context:
  maxMessages: 20        # Limit context length
  maxTokens: 8000        # Max context tokens
```

## Next Steps {#next}

- [Channels](./channels) - API channels
- [Context](./context) - Context management
