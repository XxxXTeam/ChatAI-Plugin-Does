# MCP API <Badge type="info" text="MCP" />

API endpoints for MCP server management.

## List Servers {#list}

### GET /api/mcp/servers

Get all configured MCP servers.

**Response:**
```json
{
  "success": true,
  "data": {
    "servers": [
      {
        "name": "filesystem",
        "status": "connected",
        "toolCount": 5,
        "transport": "stdio"
      },
      {
        "name": "memory",
        "status": "disconnected",
        "error": "Connection timeout"
      }
    ]
  }
}
```

## Get Server Details {#details}

### GET /api/mcp/servers/:name

Get specific server information.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "filesystem",
    "status": "connected",
    "config": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem"]
    },
    "tools": [
      {
        "name": "read_file",
        "description": "Read file contents"
      }
    ]
  }
}
```

## Connect Server {#connect}

### POST /api/mcp/servers/:name/connect

Connect to an MCP server.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "filesystem",
    "status": "connected",
    "toolCount": 5
  }
}
```

## Disconnect Server {#disconnect}

### POST /api/mcp/servers/:name/disconnect

Disconnect from an MCP server.

**Response:**
```json
{
  "success": true
}
```

## Add Server {#add}

### POST /api/mcp/servers

Add new MCP server configuration.

**Request:**
```json
{
  "name": "my-server",
  "config": {
    "command": "npx",
    "args": ["-y", "@org/mcp-server"],
    "env": {
      "API_KEY": "xxx"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "my-server",
    "status": "disconnected"
  }
}
```

## Update Server {#update}

### PUT /api/mcp/servers/:name

Update server configuration.

**Request:**
```json
{
  "config": {
    "command": "npx",
    "args": ["-y", "@org/mcp-server", "--option"]
  }
}
```

## Delete Server {#delete}

### DELETE /api/mcp/servers/:name

Remove MCP server configuration.

**Response:**
```json
{
  "success": true
}
```

## List Server Tools {#tools}

### GET /api/mcp/servers/:name/tools

Get tools provided by a server.

**Response:**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "read_file",
        "description": "Read file contents",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": { "type": "string" }
          }
        }
      }
    ]
  }
}
```

## Error Codes {#errors}

| Code | Description |
|:-----|:------------|
| `SERVER_NOT_FOUND` | Server doesn't exist |
| `ALREADY_CONNECTED` | Already connected |
| `CONNECTION_FAILED` | Failed to connect |
| `TIMEOUT` | Connection timeout |

## Next Steps {#next}

- [Tools API](./tools) - Tool management
- [Chat API](./chat) - Chat endpoints
