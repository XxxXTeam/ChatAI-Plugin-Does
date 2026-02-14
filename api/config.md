# 配置接口

## 获取配置

```http
GET /api/config
```

**响应**

```json
{
  "success": true,
  "data": {
    "basic": {
      "commandPrefix": "#",
      "debug": false
    },
    "trigger": {
      "private": "prefix",
      "group": "at",
      "prefix": "#chat"
    },
    "channels": [...],
    "context": {...},
    "memory": {...}
  }
}
```

## 更新配置

```http
PUT /api/config
```

**请求体**

```json
{
  "path": "trigger.prefix",
  "value": "#ai"
}
```

**响应**

```json
{
  "success": true
}
```

## 获取渠道列表

```http
GET /api/config/channels
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "openai",
      "type": "openai",
      "baseUrl": "https://api.openai.com/v1",
      "model": "gpt-4o",
      "enabled": true
    }
  ]
}
```

## 添加渠道

```http
POST /api/config/channels
```

**请求体**

```json
{
  "name": "deepseek",
  "type": "openai",
  "baseUrl": "https://api.deepseek.com/v1",
  "apiKey": "sk-xxx",
  "model": "deepseek-chat"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "name": "deepseek"
  }
}
```

## 更新渠道

```http
PUT /api/config/channels/:name
```

**请求体**

```json
{
  "model": "deepseek-chat",
  "enabled": true
}
```

## 删除渠道

```http
DELETE /api/config/channels/:name
```

## 测试渠道

```http
POST /api/config/channels/:name/test
```

**响应**

```json
{
  "success": true,
  "data": {
    "latency": 234,
    "model": "gpt-4o"
  }
}
```

## 获取模型列表

```http
GET /api/config/channels/:name/models
```

**响应**

```json
{
  "success": true,
  "data": [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo"
  ]
}
```

## 获取预设列表

```http
GET /api/config/presets
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
    }
  ]
}
```

## 获取群组配置

```http
GET /api/config/groups/:groupId
```

**响应**

```json
{
  "success": true,
  "data": {
    "groupId": "123456789",
    "preset": "default",
    "trigger": {
      "type": "at"
    }
  }
}
```

## 更新群组配置

```http
PUT /api/config/groups/:groupId
```

**请求体**

```json
{
  "preset": "creative",
  "trigger": {
    "type": "both",
    "randomRate": 10
  }
}
```
