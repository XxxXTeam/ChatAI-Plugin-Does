# 聊天接口

## 发送消息

```http
POST /api/chat
```

**请求体**

```json
{
  "message": "你好",
  "userId": "123456",
  "groupId": "789",
  "presetId": "default",
  "stream": false
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "content": "你好！有什么可以帮助你的吗？",
    "toolCalls": [],
    "usage": {
      "promptTokens": 50,
      "completionTokens": 20
    }
  }
}
```

## 流式聊天

```http
POST /api/chat/stream
```

**请求体**

```json
{
  "message": "写一首诗",
  "userId": "123456"
}
```

**响应** (SSE)

```
data: {"type": "content", "data": "春"}

data: {"type": "content", "data": "风"}

data: {"type": "content", "data": "又绿"}

data: {"type": "tool_call", "data": {"name": "get_time", "args": {}}}

data: {"type": "tool_result", "data": {"result": "..."}}

data: {"type": "done", "data": {"usage": {...}}}
```

## 获取对话历史

```http
GET /api/chat/history
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| groupId | string | 群组 ID |
| limit | number | 返回条数 |

**响应**

```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "你好",
      "timestamp": "2024-12-15T06:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "你好！",
      "timestamp": "2024-12-15T06:30:01.000Z"
    }
  ]
}
```

## 清除对话历史

```http
DELETE /api/chat/history
```

**请求体**

```json
{
  "userId": "123456",
  "groupId": "789"
}
```

## 获取对话统计

```http
GET /api/chat/stats
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| period | string | 统计周期 (day/week/month) |

**响应**

```json
{
  "success": true,
  "data": {
    "totalMessages": 150,
    "totalTokens": 25000,
    "toolCalls": 30,
    "byDay": [
      {"date": "2024-12-15", "messages": 20}
    ]
  }
}
```

## 获取记忆

```http
GET /api/chat/memories
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| userId | string | 用户 ID |
| query | string | 搜索关键词 |
| limit | number | 返回条数 |

**响应**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "用户喜欢编程",
      "score": 0.85,
      "createdAt": "2024-12-10T10:00:00.000Z"
    }
  ]
}
```

## 添加记忆

```http
POST /api/chat/memories
```

**请求体**

```json
{
  "userId": "123456",
  "content": "用户是一名软件工程师"
}
```

## 删除记忆

```http
DELETE /api/chat/memories/:id
```

## 清除用户记忆

```http
DELETE /api/chat/memories
```

**请求体**

```json
{
  "userId": "123456"
}
```

## 获取可用预设

```http
GET /api/chat/presets
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "id": "default",
      "name": "默认助手",
      "description": "通用 AI 助手"
    },
    {
      "id": "creative",
      "name": "创意写作",
      "description": "富有想象力的写作助手"
    }
  ]
}
```

## 错误响应

### 渠道不可用

```json
{
  "success": false,
  "error": "No available channel",
  "code": "CHANNEL_UNAVAILABLE"
}
```

### 限流

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED"
}
```

### API 错误

```json
{
  "success": false,
  "error": "API request failed",
  "code": "API_ERROR",
  "details": {
    "status": 429,
    "message": "Rate limit exceeded"
  }
}
```
