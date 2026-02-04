# 群组管理 API <Badge type="tip" text="REST API" />

群组管理 API 提供群组级别的配置和管理功能。

::: warning 🔐 权限要求
此 API 需要**群管理权限**，普通用户无法访问其他群的配置。
:::

## 概述 {#overview}

| 项目 | 值 |
|:-----|:---|
| **Base Path** | `/api/group-admin` |
| **认证** | 需要登录 |
| **权限** | 需要群管理权限 |

## 接口列表

### 获取群列表

获取当前用户可管理的群列表。

```http
GET /api/group-admin/groups
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "123456789",
        "name": "测试群",
        "memberCount": 100,
        "enabled": true,
        "preset": "default",
        "hasCustomConfig": true
      }
    ]
  }
}
```

### 获取群配置

获取指定群的详细配置。

```http
GET /api/group-admin/groups/:groupId/config
```

**路径参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `groupId` | string | 群号 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "groupId": "123456789",
    "enabled": true,
    "preset": "default",
    "triggers": {
      "prefix": ["#ai"],
      "at": true,
      "random": 0
    },
    "tools": {
      "enabled": true,
      "allowedCategories": ["basic", "user"],
      "disabledTools": []
    },
    "memory": {
      "enabled": true
    },
    "rateLimit": {
      "enabled": false,
      "maxRequests": 10,
      "windowSeconds": 60
    }
  }
}
```

### 更新群配置

更新指定群的配置。

```http
PUT /api/group-admin/groups/:groupId/config
```

**请求体**

```json
{
  "enabled": true,
  "preset": "custom-preset",
  "triggers": {
    "prefix": ["#ai", "小助手"],
    "at": true
  }
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "message": "配置已更新"
  }
}
```

### 重置群配置

重置群配置为默认值。

```http
DELETE /api/group-admin/groups/:groupId/config
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "message": "配置已重置"
  }
}
```

### 获取群成员列表

```http
GET /api/group-admin/groups/:groupId/members
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `page` | number | 页码，默认 1 |
| `limit` | number | 每页数量，默认 50 |
| `search` | string | 搜索关键词 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "members": [
      {
        "userId": "111222333",
        "nickname": "用户A",
        "role": "member",
        "blocked": false,
        "lastActive": "2024-12-15T10:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

### 更新成员设置

```http
PUT /api/group-admin/groups/:groupId/members/:userId
```

**请求体**

```json
{
  "blocked": true,
  "remark": "违规用户"
}
```

### 获取群统计

```http
GET /api/group-admin/groups/:groupId/stats
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `period` | string | 统计周期：`day`, `week`, `month` |

**响应示例**

```json
{
  "success": true,
  "data": {
    "totalMessages": 1500,
    "aiResponses": 300,
    "toolCalls": 50,
    "activeUsers": 25,
    "topUsers": [
      { "userId": "111", "nickname": "用户A", "count": 50 }
    ],
    "dailyStats": [
      { "date": "2024-12-15", "messages": 100, "responses": 20 }
    ]
  }
}
```

### 获取群对话历史

```http
GET /api/group-admin/groups/:groupId/conversations
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `limit` | number | 数量限制 |
| `before` | string | 时间戳，获取此时间之前的记录 |

### 清除群对话历史

```http
DELETE /api/group-admin/groups/:groupId/conversations
```

### 获取群记忆

```http
GET /api/group-admin/groups/:groupId/memories
```

**查询参数**

| 参数 | 类型 | 说明 |
|:-----|:-----|:-----|
| `category` | string | 记忆分类 |
| `limit` | number | 数量限制 |

### 批量操作

#### 批量更新群配置

```http
POST /api/group-admin/groups/batch
```

**请求体**

```json
{
  "groupIds": ["123456789", "987654321"],
  "action": "update",
  "config": {
    "enabled": true
  }
}
```

#### 批量启用/禁用

```http
POST /api/group-admin/groups/batch/toggle
```

**请求体**

```json
{
  "groupIds": ["123456789", "987654321"],
  "enabled": true
}
```

## 群预设管理

### 获取群可用预设

```http
GET /api/group-admin/groups/:groupId/presets
```

### 设置群预设

```http
PUT /api/group-admin/groups/:groupId/preset
```

**请求体**

```json
{
  "presetId": "custom-preset"
}
```

## 群工具配置

### 获取群工具设置

```http
GET /api/group-admin/groups/:groupId/tools
```

### 更新群工具设置

```http
PUT /api/group-admin/groups/:groupId/tools
```

**请求体**

```json
{
  "enabled": true,
  "allowedCategories": ["basic", "user", "web"],
  "disabledTools": ["execute_command"],
  "allowDangerous": false
}
```

## 群触发配置

### 获取触发设置

```http
GET /api/group-admin/groups/:groupId/triggers
```

### 更新触发设置

```http
PUT /api/group-admin/groups/:groupId/triggers
```

**请求体**

```json
{
  "prefix": ["#ai", "小助手"],
  "at": true,
  "random": 0.05,
  "keywords": ["帮我", "请问"]
}
```

## 错误响应

```json
{
  "success": false,
  "error": "群组不存在或无权限访问",
  "code": "GROUP_NOT_FOUND"
}
```

### 错误码

| 错误码 | 说明 |
|:-------|:-----|
| `GROUP_NOT_FOUND` | 群组不存在 |
| `NO_PERMISSION` | 无管理权限 |
| `INVALID_CONFIG` | 配置格式错误 |
| `USER_NOT_FOUND` | 用户不存在 |

## 代码示例

### JavaScript

```javascript
// 获取群配置
const response = await fetch('/api/group-admin/groups/123456789/config', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { data } = await response.json()

// 更新群配置
await fetch('/api/group-admin/groups/123456789/config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    preset: 'new-preset',
    triggers: { at: true }
  })
})
```

## 下一步

- [预设接口](./presets) - 预设管理 API
- [配置接口](./config) - 全局配置 API
