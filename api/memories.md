# 记忆接口

结构化用户记忆管理，支持分类、搜索、统计和批量操作。

## 获取用户列表

```http
GET /api/memories/users
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
GET /api/memories/stats
```

**响应**

```json
{
  "success": true,
  "data": {
    "totalMemories": 120,
    "totalUsers": 8,
    "categories": {
      "basic_info": "基本信息",
      "preferences": "偏好习惯",
      "events": "重要事件",
      "relationships": "人际关系",
      "interests": "话题兴趣",
      "custom": "自定义"
    }
  }
}
```

## 获取分类定义

```http
GET /api/memories/categories
```

## 获取用户记忆

```http
GET /api/memories/user/:userId
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| category | string | 按分类过滤 |
| limit | number | 返回条数 |

## 搜索记忆

```http
GET /api/memories/search
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| query | string | 搜索关键词 |
| userId | string | 限定用户 |
| limit | number | 返回条数 |

## 添加记忆

```http
POST /api/memories/user/:userId
```

**请求体**

```json
{
  "content": "用户是一名软件工程师",
  "category": "basic_info"
}
```

## 更新记忆

```http
PUT /api/memories/:id
```

## 删除记忆

```http
DELETE /api/memories/:id
```

## 清除用户记忆

```http
DELETE /api/memories/user/:userId
```

## 总结记忆

```http
POST /api/memories/user/:userId/summarize
```

将用户记忆进行 AI 总结合并，减少冗余条目。
