# 知识库接口

知识库文档的增删改查和语义搜索。

## 获取所有文档

```http
GET /api/knowledge
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "文档标题",
      "content": "内容摘要（前500字符）...",
      "contentLength": 2500,
      "truncated": true,
      "presetId": "default",
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

## 搜索知识库

```http
GET /api/knowledge/search
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| query | string | 搜索关键词 |
| presetId | string | 按预设过滤 |
| limit | number | 返回条数（默认 10） |

## 获取单个文档

```http
GET /api/knowledge/:id
```

## 创建文档

```http
POST /api/knowledge
```

**请求体**

```json
{
  "title": "文档标题",
  "content": "文档内容...",
  "presetId": "default"
}
```

## 更新文档

```http
PUT /api/knowledge/:id
```

## 删除文档

```http
DELETE /api/knowledge/:id
```
