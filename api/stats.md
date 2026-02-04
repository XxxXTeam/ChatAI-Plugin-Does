# 统计与系统 API <Badge type="tip" text="REST API" />

系统状态、统计数据和日志相关接口。

::: info 📊 监控与统计
这些接口用于监控系统运行状态、查看使用统计和日志，适合运维和数据分析场景。
:::

## 系统状态 {#system-status}

### 获取系统状态

```http
GET /api/system/status
```

**响应示例**

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

### 获取系统信息

```http
GET /api/system/info
```

**响应示例**

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

### 健康检查

```http
GET /api/system/health
```

**响应示例**

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

## 使用统计

### 获取使用统计

```http
GET /api/stats
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `period` | string | 统计周期：`day`, `week`, `month`, `all` |
| `groupId` | string | 按群过滤 |

**响应示例**

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

### 获取模型使用统计

```http
GET /api/stats/models
```

**响应示例**

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

### 获取工具使用统计

```http
GET /api/stats/tools
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "get_time",
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

### 获取用户排行

```http
GET /api/stats/users
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `limit` | number | 返回数量，默认 20 |
| `sort` | string | 排序字段：`messages`, `tokens` |

**响应示例**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "111222333",
        "nickname": "活跃用户",
        "messages": 500,
        "tokens": 100000,
        "lastActive": "2024-12-15T15:30:00Z"
      }
    ]
  }
}
```

### 获取群排行

```http
GET /api/stats/groups
```

## 日志接口

### 获取系统日志

```http
GET /api/logs
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `level` | string | 日志级别：`error`, `warn`, `info`, `debug` |
| `limit` | number | 数量限制 |
| `before` | string | 时间戳 |

**响应示例**

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

### 获取工具执行日志

```http
GET /api/logs/tools
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `toolName` | string | 工具名称过滤 |
| `userId` | string | 用户 ID 过滤 |
| `status` | string | 状态：`success`, `error` |
| `limit` | number | 数量限制 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "toolName": "get_weather",
        "args": { "city": "北京" },
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

### 获取错误日志

```http
GET /api/logs/errors
```

**响应示例**

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

## 渠道统计

### 获取渠道状态

```http
GET /api/stats/channels
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "channels": [
      {
        "id": "openai-main",
        "name": "OpenAI 主渠道",
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

## 实时监控

### SSE 实时状态

```http
GET /api/system/events
```

使用 Server-Sent Events 实时推送系统状态。

```javascript
const eventSource = new EventSource('/api/system/events')

eventSource.addEventListener('status', (event) => {
  const status = JSON.parse(event.data)
  console.log('系统状态更新:', status)
})

eventSource.addEventListener('metric', (event) => {
  const metric = JSON.parse(event.data)
  console.log('指标更新:', metric)
})
```

**事件类型**

| 事件 | 说明 |
|:-----|:-----|
| `status` | 系统状态变化 |
| `metric` | 实时指标 |
| `error` | 错误通知 |
| `channel` | 渠道状态变化 |

## 代码示例

### JavaScript

```javascript
// 获取系统状态
const status = await fetch('/api/system/status').then(r => r.json())

// 获取使用统计
const stats = await fetch('/api/stats?period=week').then(r => r.json())

// 实时监控
const es = new EventSource('/api/system/events')
es.onmessage = (e) => {
  console.log('Event:', JSON.parse(e.data))
}
```

### cURL

```bash
# 获取系统状态
curl http://localhost:3000/api/system/status \
  -H "Authorization: Bearer $TOKEN"

# 获取统计数据
curl "http://localhost:3000/api/stats?period=week" \
  -H "Authorization: Bearer $TOKEN"
```

## 下一步

- [认证接口](./auth) - 认证 API
- [配置接口](./config) - 配置 API
