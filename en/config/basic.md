# Basic Configuration <Badge type="tip" text="Core" />

Core configuration options for ChatAI Plugin.

## Configuration File {#file}

Location: `plugins/chatai-plugin/config/config.yaml`

## Core Options {#core}

```yaml
# Command prefix
commandPrefix: "#"

# Debug mode
debug: false

# Master users (bot owners)
masters:
  - "123456789"
  - "987654321"

# Web panel port
web:
  enabled: true
  port: 3000
  host: "127.0.0.1"
```

## Option Reference {#options}

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `commandPrefix` | string | `"#"` | Command prefix |
| `debug` | boolean | `false` | Enable debug logging |
| `masters` | array | `[]` | Master user IDs |
| `web.enabled` | boolean | `true` | Enable web panel |
| `web.port` | number | `3000` | Web panel port |
| `web.host` | string | `127.0.0.1` | Listen address |

## Command Prefix {#prefix}

All commands use this prefix:

```yaml
commandPrefix: "#"
```

Commands: `#ai状态`, `#ai管理面板`, `#结束对话`

## Debug Mode {#debug}

Enable verbose logging:

```yaml
debug: true
```

Or via command:
```txt
#ai调试开启
#ai调试关闭
```

## Master Users {#masters}

Bot owners with full permissions:

```yaml
masters:
  - "123456789"    # QQ number
```

Masters can:
- Access all commands
- Use dangerous tools
- Manage all groups
- Access admin panel

## Web Panel {#web}

```yaml
web:
  enabled: true
  port: 3000
  host: "0.0.0.0"     # Allow external access
  ssl:
    enabled: false
    cert: "./cert.pem"
    key: "./key.pem"
```

::: warning Security
Use `127.0.0.1` (localhost only) unless you need external access.
If exposing externally, enable SSL and use strong auth.
:::

## Logging {#logging}

```yaml
logging:
  level: info          # debug, info, warn, error
  file: true           # Log to file
  console: true        # Log to console
  maxSize: 10485760    # 10MB max per file
  maxFiles: 5          # Keep 5 log files
```

## Hot Reload {#hot-reload}

Most settings reload without restart:

```txt
#ai重载配置
```

Settings requiring restart:
- Web server port
- Database path
- SSL configuration

## Next Steps {#next}

- [Channels](./channels) - API configuration
- [Triggers](./triggers) - Trigger settings
- [Features](./features) - Feature options
