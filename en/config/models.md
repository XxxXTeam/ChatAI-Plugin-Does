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
| `o1` / `o3-mini` | 128K | Reasoning |
| `gpt-4-turbo` | 128K | Complex tasks |

### Claude {#claude-models}

| Model | Context | Best For |
|:------|:--------|:---------|
| `claude-sonnet-4` | 200K | Latest, best overall |
| `claude-3-5-sonnet` | 200K | Strong performance |
| `claude-3-5-haiku` | 200K | Fast, cheap |
| `claude-3-opus` | 200K | Complex tasks |

### Gemini {#gemini-models}

| Model | Context | Best For |
|:------|:--------|:---------|
| `gemini-2.5-flash` | 1M | Latest Flash |
| `gemini-2.5-pro` | 1M | Latest Pro |
| `gemini-2.0-flash` | 1M | Fast, general |
| `gemini-1.5-pro` | 2M | Long context |

### DeepSeek {#deepseek-models}

| Model | Context | Best For |
|:------|:--------|:---------|
| `deepseek-chat` | 64K | V3, Chinese & coding |
| `deepseek-reasoner` | 64K | R1 reasoning |

### Others {#other-models}

| Model | Provider | Best For |
|:------|:---------|:---------|
| `grok-3` / `grok-3-mini` | xAI | General, tools |
| `mistral-large-latest` | Mistral | Flagship |
| `llama-3.3-70b-versatile` | Groq | Ultra-fast inference |
| `glm-4-plus` / `glm-4-flash` | Zhipu AI | Chinese |
| `qwen-max` / `qwen-plus` | Qwen | Chinese |

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
