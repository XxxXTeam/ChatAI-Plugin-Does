# MCP Configuration <Badge type="info" text="MCP" />

Configure MCP (Model Context Protocol) server integration.

## Overview {#overview}

MCP enables AI to use external tools via the MCP protocol.

## Basic Configuration {#basic}

```yaml
mcp:
  enabled: true           # Enable MCP
  timeout: 30000          # Connection timeout (ms)
  autoConnect: true       # Auto-connect on startup
```

## Server Configuration {#servers}

Edit `data/mcp-servers.json`:

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem", "/allowed/path"],
      "env": {}
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-memory"]
    }
  }
}
```

## Server Options {#options}

| Option | Type | Description |
|:-------|:-----|:------------|
| `command` | string | Command to run |
| `args` | array | Command arguments |
| `env` | object | Environment variables |
| `cwd` | string | Working directory |
| `timeout` | number | Server timeout |

## Transport Types {#transports}

### stdio (Default) {#stdio}

```json
{
  "my-server": {
    "command": "npx",
    "args": ["-y", "@org/mcp-server"]
  }
}
```

### SSE {#sse}

```json
{
  "remote": {
    "transport": "sse",
    "url": "https://example.com/mcp/sse",
    "headers": {
      "Authorization": "Bearer token"
    }
  }
}
```

### HTTP {#http}

```json
{
  "http-server": {
    "transport": "http",
    "url": "https://example.com/mcp"
  }
}
```

## Popular MCP Servers {#popular}

| Server | Package | Description |
|:-------|:--------|:------------|
| Filesystem | `@anthropic/mcp-server-filesystem` | File operations |
| Memory | `@anthropic/mcp-server-memory` | Knowledge graph |
| Fetch | `@anthropic/mcp-server-fetch` | HTTP requests |
| GitHub | `@anthropic/mcp-server-github` | GitHub API |
| Puppeteer | `@anthropic/mcp-server-puppeteer` | Browser control |

## Management Commands {#commands}

```txt
#mcp状态           # View MCP status
#mcp重连           # Reconnect servers
#ai重载配置        # Reload configuration
```

## Web Panel {#web-panel}

Manage MCP servers in Web Admin Panel:
1. Go to **MCP** tab
2. View server status
3. Connect/disconnect servers
4. Browse available tools

## Next Steps {#next}

- [Tools](/en/tools/) - Tool development
- [Proxy](./proxy) - Network proxy
