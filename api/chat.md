# 会话与上下文接口

对话历史管理与活跃上下文管理接口。路由实现位于 `src/services/routes/conversationRoutes.js`，
在 `src/services/webServer.js` 中挂载于两个前缀，均经过 JWT 认证中间件：

```js
this.router.use('/api/conversations', createConversationRoutes(auth))
this.router.use('/api/context', createContextRoutes(auth))
```

> 说明：消息发送/流式聊天不通过本组 REST 接口，而是由应用层（`apps/chat.js`）直接调用
> `ChatService`。本页只覆盖实际存在的 HTTP 端点。

## 对话列表

```http
GET /api/conversations/list
```

**响应**：`ChaiteResponse.ok`（`{ code: 0, data, message: 'ok' }`），`data` 为
`databaseService.getConversations()` 的返回数组。

## 清空全部对话

```http
DELETE /api/conversations/clear-all
```

清空所有对话记录，并把上下文管理器（`ContextManager`）的内存态一并复位；
复位范围包括 `locks`、`processingFlags`、`messageQueues`、`requestCounters`、
`groupContextCache`、`sessionStates`。

**响应**

```json
{
  "code": 0,
  "data": { "success": true, "deletedCount": 42 },
  "message": "ok"
}
```

## 获取对话消息

```http
GET /api/conversations/:id/messages
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 会话 ID |

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `limit` | number | `100` | 返回条数，非法值回退为 `100` |

**响应**：`data` 为 `databaseService.getMessages(id, limit)` 返回的消息数组。

## 删除对话

```http
DELETE /api/conversations/:id
```

**响应**

```json
{
  "code": 0,
  "data": { "success": true },
  "message": "ok"
}
```

## 获取活跃上下文

```http
GET /api/context/list
```

**响应**：`data` 为 `contextManager.getActiveContexts()` 返回的活跃上下文数组。

## 清除上下文

```http
POST /api/context/clear
```

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userId` | string | 否 | 用户 ID，用于推导会话 ID |
| `conversationId` | string | 否 | 会话 ID；缺省时按 `userId` 经 `contextManager.getConversationId` 推导 |

处理逻辑：对目标会话调用 `contextManager.cleanContext(targetConvId)`，同时删除
`historyManager` 中对应会话的历史记录。

**响应**

```json
{
  "code": 0,
  "data": { "success": true, "message": "Context cleared" },
  "message": "ok"
}
```

## 错误响应

所有端点在异常时返回 HTTP `500` 与 `ChaiteResponse.fail(null, error.message)`
（`code` 为 `-1`，`message` 为错误描述）。