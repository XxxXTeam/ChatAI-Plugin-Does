# Stats & System API <Badge type="tip" text="REST API" />

Endpoints for system status, usage statistics, and log viewing.

::: info 📊 Monitoring & Statistics
These endpoints are for monitoring runtime status, viewing usage statistics and logs — suitable for operations and data analysis scenarios.
:::

## System Status {#system-status}

### Get System Status

```http
GET /api/system/status
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "status": "running",
    "version": "1.5.0",
    "uptime": 86400,
    "startTime": "2024-12-14T10:00:00Z",
    "nodejs": "v20.10.0",
    "memory": {
      "used": 256000000,
      "total": 512000000,
      "percentage": 50
    },
    "bot": {
      "connected": true,
      "platform": "icqq",
      "uin": "123456789"
    }
  }
}
```

### Get System Info

```http
GET /api/system/info
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "version": "1.5.0",
    "platform": "win32",
    "arch": "x64",
    "nodejs": "v20.10.0",
    "features": {
      "mcp": true,
      "memory": true,
      "galgame": true
    },
    "adapters": ["openai", "claude", "gemini"],
    "mcpServers": 3,
    "totalTools": 65
  }
}
```

### Health Check

```http
GET /api/system/health
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "healthy": true,
    "checks": {
      "database": { "status": "ok", "latency": 5 },
      "bot": { "status": "ok" },
      "channels": { "status": "ok", "available": 2 }
    }
  }
}
```

## Usage Statistics

### Get Usage Statistics

```http
GET /api/stats
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `period` | string | Statistics period: `day`, `week`, `month`, `all` |
| `groupId` | string | Filter by group |

**Response Example**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalMessages": 15000,
      "aiResponses": 3000,
      "toolCalls": 500,
      "tokensUsed": 1500000,
      "activeUsers": 150,
      "activeGroups": 20
    },
    "daily": [
      {
        "date": "2024-12-15",
        "messages": 500,
        "responses": 100,
        "toolCalls": 20,
        "tokens": 50000
      }
    ]
  }
}
```

### Get Model Usage Statistics

```http
GET /api/stats/models
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "model": "gpt-4o",
        "requests": 1500,
        "tokens": 800000,
        "avgLatency": 2500,
        "errors": 5
      },
      {
        "model": "claude-3-5-sonnet",
        "requests": 800,
        "tokens": 400000,
        "avgLatency": 3000,
        "errors": 2
      }
    ]
  }
}
```

### Get Tool Usage Statistics

```http
GET /api/stats/tools
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "get_current_time",
        "calls": 500,
        "avgDuration": 15,
        "successRate": 0.99
      },
      {
        "name": "web_search",
        "calls": 200,
        "avgDuration": 2500,
        "successRate": 0.95
      }
    ]
  }
}
```

### Get User Ranking

```http
GET /api/stats/users
```

**Query Parameters**

| Parameter | Type | Default | Description |
|:----------|:-----|:-------|:------------|
| `limit` | number | `20` | Number of results |
| `sort` | string | - | Sort field: `messages`, `tokens` |

**Response Example**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "111222333",
        "nickname": "Active User",
        "messages": 500,
        "tokens": 100000,
        "lastActive": "2024-12-15T15:30:00Z"
      }
    ]
  }
}
```

### Get Group Ranking

```http
GET /api/stats/groups
```

## Log Endpoints

### Get System Logs

```http
GET /api/logs
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `level` | string | Log level: `error`, `warn`, `info`, `debug` |
| `limit` | number | Number limit |
| `before` | string | Timestamp |

**Response Example**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2024-12-15T15:30:00Z",
        "level": "info",
        "message": "Chat request processed",
        "meta": { "userId": "123", "model": "gpt-4o" }
      }
    ]
  }
}
```

### Get Tool Execution Logs

```http
GET /api/logs/tools
```

**Query Parameters**

| Parameter | Type | Description |
|:----------|:-----|:------------|
| `toolName` | string | Filter by tool name |
| `userId` | string | Filter by user ID |
| `status` | string | Status: `success`, `error` |
| `limit` | number | Number limit |

**Response Example**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "toolName": "get_weather",
        "args": { "city": "Beijing" },
        "result": { "temp": 15 },
        "status": "success",
        "duration": 1500,
        "userId": "123456",
        "timestamp": "2024-12-15T15:30:00Z"
      }
    ]
  }
}
```

### Get Error Logs

```http
GET /api/logs/errors
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "errors": [
      {
        "timestamp": "2024-12-15T15:30:00Z",
        "error": "API rate limit exceeded",
        "stack": "...",
        "context": {
          "channel": "openai-main",
          "model": "gpt-4o"
        }
      }
    ]
  }
}
```

## Channel Statistics

### Get Channel Status

```http
GET /api/stats/channels
```

**Response Example**

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "id": "openai-main",
        "name": "OpenAI Main Channel",
        "status": "active",
        "requests": 1000,
        "errors": 5,
        "avgLatency": 2000,
        "lastUsed": "2024-12-15T15:30:00Z"
      }
    ]
  }
}
```

## Real-time Monitoring

### SSE Real-time Status

```http
GET /api/system/events
```

Uses Server-Sent Events to push system status in real time.

```javascript
const eventSource = new EventSource('/api/system/events')

eventSource.addEventListener('status', (event) => {
  const status = JSON.parse(event.data)
  console.log('System status update:', status)
})

eventSource.addEventListener('metric', (event) => {
  const metric = JSON.parse(event.data)
  console.log('Metric update:', metric)
})
```

**Event Types**

| Event | Description |
|:------|:------------|
| `status` | System status changed |
| `metric` | Real-time metrics |
| `error` | Error notification |
| `channel` | Channel status changed |

## Code Examples

### JavaScript

```javascript
// Get system status
const status = await fetch('/api/system/status').then(r => r.json())

// Get usage statistics
const stats = await fetch('/api/stats?period=week').then(r => r.json())

// Real-time monitoring
const es = new EventSource('/api/system/events')
es.onmessage = (e) => {
  console.log('Event:', JSON.parse(e.data))
}
```

### cURL

```bash
# Get system status
curl http://localhost:3000/api/system/status \
  -H "Authorization: Bearer $TOKEN"

# Get statistics
curl "http://localhost:3000/api/stats?period=week" \
  -H "Authorization: Bearer $TOKEN"
```

## Next Steps

- [Auth API](./auth) - Authentication API
- [Config API](./config) - Configuration API