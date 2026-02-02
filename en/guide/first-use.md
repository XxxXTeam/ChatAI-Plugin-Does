# First Use <Badge type="tip" text="Beginner" />

Start chatting with AI after installation.

## Start a Conversation {#start}

Based on your trigger configuration:

::: code-group
```txt [@mention]
@bot Hello, introduce yourself
```

```txt [Prefix]
#chat Hello, introduce yourself
```

```txt [Private Chat]
Hello, introduce yourself
```
:::

## Basic Commands {#commands}

| Command | Description |
|:--------|:------------|
| `#ai状态` | Check plugin status |
| `#结束对话` | End conversation, clear context |
| `#ai帮助` | Show help information |

## Conversation Tips {#tips}

### Context {#context}

AI remembers previous messages in the conversation:

```txt
User: My name is Alice
AI: Nice to meet you, Alice!

User: What's my name?
AI: Your name is Alice.
```

### Clear Context {#clear}

Start fresh conversation:

```txt
#结束对话
```

### Multi-turn {#multi-turn}

AI maintains context across messages:

```txt
User: Write a Python function to sort a list
AI: [provides code]

User: Add error handling
AI: [updates code with error handling]

User: Now add type hints
AI: [updates code with type hints]
```

## Using Tools {#tools}

AI can use tools to perform actions:

```txt
User: What time is it?
AI: It's currently 3:45 PM.

User: Search for Python tutorials
AI: [searches web] Here are some great Python tutorials...

User: Set a reminder for 5 minutes
AI: ⏰ Reminder set for 5 minutes from now.
```

## Group Chat {#group}

In groups, use the configured trigger:

```txt
@bot What's the weather like?
```

AI responds only when triggered (unless configured otherwise).

## Troubleshooting {#troubleshooting}

### No Response {#no-response}

1. Check trigger method
2. Verify channel is configured
3. Enable debug: `#ai调试开启`

### Error Messages {#errors}

Common errors:
- **401**: Check API key
- **429**: Rate limited, wait or switch channel
- **Timeout**: Check network/proxy

## Next Steps {#next}

- [Presets](/en/guide/presets) - Customize AI personality
- [Triggers](/en/guide/triggers) - Configure triggers
- [MCP Tools](/en/guide/mcp) - Use advanced tools
