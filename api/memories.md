# 记忆接口

结构化用户记忆管理，支持分类、搜索、统计和批量操作。路由挂载于 `/api/memory`（`src/services/routes/memoryRoutes.js`）。

## 获取用户列表

```http
GET /api/memory/users
```

**响应**

```json
{
  "success": true,
  "data": [
    { "userId": "123456", "memoryCount": 15 }
  ]
}
```

## 获取记忆统计

```http
GET /api/memory/stats
```

**响应**

```json
{
  "success": true,
  "data": {
    "totalMemories": 120,
    "totalUsers": 8,
    "categories": {
      "profile": "基本信息",
      "preference": "偏好习惯",
      "event": "重要事件",
      "relation": "人际关系",
      "topic": "话题兴趣",
      "custom": "自定义"
    }
  }
}
```

## 获取分类定义

```http
GET /api/memory/categories
```

## 获取用户记忆

```http
GET /api/memory/user/:userId
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| format | string | `tree`（树状结构，默认）或 `list` |
| groupId | string | 限定群组 |
| category | string | 按分类过滤 |
| limit | number | 返回条数 |

## 搜索记忆

```http
POST /api/memory/search
```

**请求体**

| 参数 | 类型 | 说明 |
|------|------|------|
| query | string | 搜索关键词（必填） |
| userId | string | 限定用户 |
| groupId | string | 限定群组 |
| category | string | 限定分类 |
| limit | number | 返回条数（默认 20） |

## 添加记忆

```http
POST /api/memory/user/:userId
```

**请求体**

```json
{
  "content": "用户是一名软件工程师",
  "category": "profile"
}
```

## 更新记忆

```http
PUT /api/memory/:id
```

## 删除记忆

```http
DELETE /api/memory/:id
```

`hard` 查询参数支持 `'true'` / `'1'`（字符串查询参数恒为字符串，旧版 `=== 'true'` 恒 false 的问题已修复）。

## 清除用户记忆

```http
DELETE /api/memory/user/:userId
```

`hard` 查询参数语义同上。

## 总结记忆

```http
POST /api/memory/user/:userId/summarize
```

将用户记忆进行 AI 总结合并，减少冗余条目。总结结果采用 `[分类] 内容` 结构化行（分类白名单 `profile` / `preference` / `event` / `relation` / `topic` / `custom`），模型输出的思考过程不会入库。

**请求体**

```json
{
  "useLLM": true,
  "cleanup": true
}
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `useLLM` | boolean | `true` | 是否使用 LLM 总结 |
| `cleanup` | boolean | `true` | 总结后是否执行低质量记忆清理（`cleanup === false` / `'false'` 时跳过） |
| `groupId` | string | - | 限定群组 |
| `model` | string | - | 指定总结模型 |

## 清理低质量记忆

```http
POST /api/memory/user/:userId/cleanup
```

清理该用户的低质量记忆（低置信度 / 过期 / 过老 / 过短），无需 LLM 调用。