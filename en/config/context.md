# Context Configuration <Badge type="tip" text="Context" />

Configure conversation context management.

## Overview {#overview}

Context determines how much conversation history AI remembers.

## Basic Configuration {#basic}

```yaml
context:
  maxMessages: 20          # Max messages in context
  maxTokens: 8000          # Max tokens in context
  cleaningStrategy: sliding # sliding, truncate, smart
```

## Configuration Options {#options}

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `maxMessages` | number | `20` | Max messages kept |
| `maxTokens` | number | `8000` | Max tokens in context |
| `cleaningStrategy` | string | `sliding` | How to trim context |
| `includeSystemPrompt` | boolean | `true` | Include system prompt |
| `summarizeOld` | boolean | `false` | Summarize old messages |

## Cleaning Strategies {#strategies}

### sliding {#sliding}

Removes oldest messages when limit reached.

```
[msg1, msg2, msg3, msg4, msg5] + new_msg
→ [msg2, msg3, msg4, msg5, new_msg]
```

### truncate {#truncate}

Clears all context when limit reached.

```
[msg1, msg2, msg3, msg4, msg5] + new_msg (limit reached)
→ [new_msg]
```

### smart {#smart}

Summarizes old messages instead of removing.

```
[msg1, msg2, msg3, msg4, msg5] + new_msg
→ [summary_of_1-3, msg4, msg5, new_msg]
```

## Per-Group Context {#per-group}

```yaml
groups:
  123456789:
    context:
      maxMessages: 50      # Higher limit for this group
      cleaningStrategy: smart
```

## Context Commands {#commands}

```txt
#结束对话     # Clear current context
#上下文       # View context status
```

## Token Optimization {#optimization}

::: tip Reduce Token Usage
- Lower `maxMessages` for less context
- Use shorter system prompts
- Enable `summarizeOld` for long conversations
:::

```yaml
context:
  maxMessages: 10
  summarizeOld: true
  summaryMaxTokens: 500
```

## API Access {#api}

```javascript
// Get context
const ctx = await fetch('/api/conversations/123/context')

// Clear context
await fetch('/api/conversations/123/clear', { method: 'POST' })
```

## Next Steps {#next}

- [Memory](./memory) - Long-term memory
- [Models](./models) - Model parameters
