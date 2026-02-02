# BYM Mode <Badge type="warning" text="Advanced" />

Configure persona mode for natural, human-like interactions.

## Overview {#overview}

BYM (Be Your Mind) mode makes AI behave more like a real person, with proactive messages and personality.

::: warning Advanced Feature
BYM mode requires careful configuration. Inappropriate settings may cause spam or unwanted behavior.
:::

## Basic Configuration {#basic}

```yaml
bym:
  enabled: false         # Disabled by default
  persona: "default"     # Persona preset
  proactiveChat: false   # Proactive messages
```

## Persona Configuration {#persona}

```yaml
bym:
  enabled: true
  persona:
    name: "小助手"
    personality: friendly
    speakingStyle: casual
    interests:
      - music
      - technology
      - games
```

## Proactive Chat {#proactive}

AI initiates conversations:

```yaml
bym:
  proactiveChat:
    enabled: true
    minInterval: 3600000   # Min 1 hour between
    maxPerDay: 5           # Max 5 per day
    triggers:
      - timeOfDay           # Morning greetings
      - groupActivity       # When group is active
      - keywords            # Specific topics
```

## Response Style {#style}

```yaml
bym:
  style:
    useEmoji: true
    casualLanguage: true
    shortResponses: true
    personality:
      cheerful: 0.8
      helpful: 0.9
      humorous: 0.5
```

## Group-Specific BYM {#per-group}

```yaml
groups:
  123456789:
    bym:
      enabled: true
      persona: "catgirl"
      proactiveChat: true
  987654321:
    bym:
      enabled: false
```

## Safety Controls {#safety}

```yaml
bym:
  safety:
    maxMessagesPerMinute: 3
    cooldownAfterError: 300000
    blacklistKeywords: []
    requireMention: true
```

## Personality Templates {#templates}

| Template | Description |
|:---------|:------------|
| `default` | Balanced assistant |
| `friendly` | Warm and approachable |
| `professional` | Formal and precise |
| `playful` | Fun and casual |
| `catgirl` | Cute cat persona |

## Commands {#commands}

```txt
#bym开启          # Enable BYM mode
#bym关闭          # Disable BYM mode
#bym状态          # View BYM status
```

## Best Practices {#best-practices}

| Practice | Reason |
|:---------|:-------|
| Start conservative | Prevent spam |
| Test in private group | Avoid disruption |
| Monitor closely | Catch issues early |
| Set rate limits | Prevent abuse |

## Next Steps {#next}

- [Features](./features) - Other features
- [Presets](/en/guide/presets) - AI personas
