# Proxy Configuration <Badge type="tip" text="Network" />

Configure network proxy for API access.

## Basic Configuration {#basic}

```yaml
proxy:
  enabled: true
  type: http              # http, socks5
  host: 127.0.0.1
  port: 7890
```

## Configuration Options {#options}

| Option | Type | Default | Description |
|:-------|:-----|:--------|:------------|
| `enabled` | boolean | `false` | Enable proxy |
| `type` | string | `http` | Proxy type |
| `host` | string | `127.0.0.1` | Proxy host |
| `port` | number | `7890` | Proxy port |
| `username` | string | - | Auth username |
| `password` | string | - | Auth password |
| `noProxy` | array | `[]` | Bypass list |

## Proxy Types {#types}

### HTTP Proxy {#http}

```yaml
proxy:
  enabled: true
  type: http
  host: 127.0.0.1
  port: 7890
```

### SOCKS5 Proxy {#socks5}

```yaml
proxy:
  enabled: true
  type: socks5
  host: 127.0.0.1
  port: 1080
```

### With Authentication {#auth}

```yaml
proxy:
  enabled: true
  type: http
  host: proxy.example.com
  port: 8080
  username: user
  password: ${PROXY_PASSWORD}
```

## Bypass List {#bypass}

Domains that should bypass proxy:

```yaml
proxy:
  enabled: true
  type: http
  host: 127.0.0.1
  port: 7890
  noProxy:
    - localhost
    - 127.0.0.1
    - api.deepseek.com    # Domestic API
```

## Environment Variables {#env}

Alternative to config file:

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1
```

## Per-Channel Proxy {#per-channel}

```yaml
channels:
  - name: openai
    baseUrl: https://api.openai.com/v1
    proxy:
      enabled: true
      host: 127.0.0.1
      port: 7890
      
  - name: deepseek
    baseUrl: https://api.deepseek.com
    proxy:
      enabled: false       # No proxy needed
```

## Testing Proxy {#testing}

```bash
# Test HTTP proxy
curl -x http://127.0.0.1:7890 https://api.openai.com/v1/models

# Test SOCKS5 proxy
curl -x socks5://127.0.0.1:1080 https://api.openai.com/v1/models
```

## Troubleshooting {#troubleshooting}

| Issue | Solution |
|:------|:---------|
| Connection timeout | Check proxy is running |
| Auth failed | Verify username/password |
| Some requests fail | Check noProxy list |

## Next Steps {#next}

- [Channels](./channels) - Channel configuration
- [Troubleshooting](/en/troubleshooting) - Common issues
