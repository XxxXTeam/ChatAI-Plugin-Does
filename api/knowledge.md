# 知识库接口

知识库路由位于 `src/services/routes/knowledgeRoutes.js`，挂载于 `/api/knowledge`（JWT 认证）。
响应封装为 `ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。

## 获取所有文档

```http
GET /api/knowledge
```

列表模式只返回内容摘要：`content` 截断为前 500 字符，附带 `contentLength` 与
`truncated`（内容超过 500 字符时为 `true`）。

```json
{
  "code": 0,
  "data": [
    {
      "id": "uuid",
      "title": "文档标题",
      "content": "内容摘要（前500字符）...",
      "contentLength": 2500,
      "truncated": true,
      "presetId": "default",
      "createdAt": 1700000000000
    }
  ],
  "message": "ok"
}
```

## 搜索知识库

```http
GET /api/knowledge/search
```

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `query` | string | 必填 | 搜索关键词；缺失/空返回 `400`（`query is required`） |
| `presetId` | string | - | 按预设过滤 |
| `limit` | number | `10` | 返回条数，钳制在 1~100（非法值回退 10） |

## 获取单个文档

```http
GET /api/knowledge/:id
```

不存在时返回 `404`（`Document not found`）。

## 创建文档

```http
POST /api/knowledge
```

请求体直接交给 `knowledgeService.create`（`title` / `content` / `presetId` 等），
成功返回 `201` 与创建后的文档。

## 导入知识库

```http
POST /api/knowledge/import
```

**请求体**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `data` | string | 必填 | 原始内容 |
| `format` | string | `raw` | 导入格式 |
| `name` | string | - | 文档名 |

成功返回 `201` 与导入结果。

## 更新文档

```http
PUT /api/knowledge/:id
```

## 删除文档

```http
DELETE /api/knowledge/:id
```

不存在时返回 `404`（`Document not found`）。

## 预设关联

```http
POST   /api/knowledge/:id/link/:presetId
DELETE /api/knowledge/:id/link/:presetId
```

将知识库文档关联到指定预设 / 取消关联，响应 `{ success: true }`。