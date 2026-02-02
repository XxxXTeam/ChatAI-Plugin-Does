# Tools API <Badge type="tip" text="Tools" />

API endpoints for tool management and invocation.

## List Tools {#list}

### GET /api/tools

Get all available tools.

**Response:**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "get_current_time",
        "description": "Get current time",
        "category": "basic",
        "enabled": true
      }
    ],
    "categories": {
      "basic": { "name": "Basic", "enabled": true },
      "admin": { "name": "Admin", "enabled": false }
    }
  }
}
```

## Get Tool Details {#details}

### GET /api/tools/:name

Get specific tool information.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "get_current_time",
    "description": "Get current time and date",
    "category": "basic",
    "inputSchema": {
      "type": "object",
      "properties": {
        "format": { "type": "string" }
      }
    }
  }
}
```

## Toggle Tool {#toggle}

### PUT /api/tools/:name/toggle

Enable or disable a tool.

**Request:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "get_current_time",
    "enabled": true
  }
}
```

## Toggle Category {#toggle-category}

### PUT /api/tools/category/:category/toggle

Enable or disable entire category.

**Request:**
```json
{
  "enabled": false
}
```

## Get Tool Logs {#logs}

### GET /api/tools/logs

Get recent tool call logs.

**Query Parameters:**
| Param | Type | Description |
|:------|:-----|:------------|
| `limit` | number | Max results (default 50) |
| `offset` | number | Pagination offset |
| `tool` | string | Filter by tool name |

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "abc123",
        "tool": "get_current_time",
        "args": {},
        "result": { "time": "14:30" },
        "duration": 15,
        "timestamp": 1702622400000,
        "userId": "123456789",
        "groupId": "987654321"
      }
    ],
    "total": 100
  }
}
```

## Call Tool (Debug) {#call}

### POST /api/tools/call

Manually call a tool for testing.

**Request:**
```json
{
  "name": "get_current_time",
  "args": {
    "format": "full"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "text": "2024-12-15 14:30:00",
      "timestamp": 1702622400000
    },
    "duration": 12
  }
}
```

## Error Codes {#errors}

| Code | Description |
|:-----|:------------|
| `TOOL_NOT_FOUND` | Tool doesn't exist |
| `TOOL_DISABLED` | Tool is disabled |
| `INVALID_ARGS` | Invalid arguments |
| `EXECUTION_ERROR` | Tool execution failed |

## Next Steps {#next}

- [MCP API](./mcp) - MCP server management
- [Configuration API](./config) - Config endpoints
