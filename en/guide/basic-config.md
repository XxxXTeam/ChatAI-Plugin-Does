# Basic Configuration <Badge type="tip" text="Setup" />

Essential configuration after installation.

## Configuration Methods {#methods}

### Web Panel (Recommended) {#web-panel}

```txt
#ai管理面板
```

Visual interface, changes apply immediately.

### Config File {#file}

Edit `config/config.yaml` directly.

## Essential Settings {#essential}

### 1. Add API Channel {#add-channel}

```yaml
channels:
  - name: main
    baseUrl: https://api.openai.com/v1
    apiKey: ${OPENAI_API_KEY}
    model: gpt-4o
```

::: tip Environment Variables
Store API keys in environment variables for security:
```bash
export OPENAI_API_KEY=sk-xxx
```
:::

### 2. Set Trigger Mode {#trigger}

```yaml
trigger:
  private: always     # Respond to all private messages
  group: at          # Require @mention in groups
  prefix: "#chat"    # Optional prefix trigger
```

### 3. Configure Masters {#masters}

```yaml
masters:
  - "123456789"      # Your QQ number
```

## Verify Configuration {#verify}

Test your setup:

```txt
#ai状态
```

You should see:
- ✅ Channel connected
- ✅ Model available
- ✅ Tools loaded

## Quick Config Examples {#examples}

### Minimal Setup {#minimal}

```yaml
channels:
  - name: default
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o

trigger:
  private: always
  group: at
```

### With Proxy {#with-proxy}

```yaml
channels:
  - name: default
    baseUrl: https://api.openai.com/v1
    apiKey: sk-xxx
    model: gpt-4o

proxy:
  enabled: true
  type: http
  host: 127.0.0.1
  port: 7890
```

### Multiple Channels {#multi-channel}

```yaml
channels:
  - name: openai
    baseUrl: https://api.openai.com/v1
    apiKey: ${OPENAI_API_KEY}
    model: gpt-4o
    priority: 1
    
  - name: deepseek
    baseUrl: https://api.deepseek.com
    apiKey: ${DEEPSEEK_API_KEY}
    model: deepseek-chat
    priority: 2
```

## Reload Config {#reload}

After editing config file:

```txt
#ai重载配置
```

## Next Steps {#next}

- [Channels](/en/guide/channels) - Multi-channel setup
- [Presets](/en/guide/presets) - AI personas
- [Triggers](/en/guide/triggers) - Trigger configuration
