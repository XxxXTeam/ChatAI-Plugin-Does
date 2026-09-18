# 记忆接口

结构化用户记忆管理，支持分类、搜索、统计和批量操作。路由挂载于 `/api/memory`
（`src/services/routes/memoryRoutes.js`），数据层为
`src/services/memory/MemoryService.js`（表 `structured_memories`）。响应封装为
`ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。

## 获取用户列表

```http
GET /api/memory/users
```

**响应**：`data` 为 `memoryService.listUsers()` 数组：

```json
{
  "code": 0,
  "data": [
    { "userId": "123456", "count": 15, "lastUpdate": 1700000000000, "categories": ["profile", "preference"] }
  ],
  "message": "ok"
}
```

## 获取记忆统计

```http
GET /api/memory/stats
GET /api/memory/user/:userId/stats       # 单用户统计
```

全局统计 `data`（`getStats()` 全局分支）：

```json
{ "total": 120, "users": 8, "byCategory": { "profile": 30, "preference": 20 } }
```

单用户统计 `data`（`getStats(userId)`）：`{ total, byCategory }`。

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
| query | string | 搜索关键词（必填，缺失返回 `400`） |
| userId | string | 限定用户 |
| groupId | string | 限定群组 |
| category | string | 限定分类 |
| limit | number | 返回条数（默认 20） |

## 添加记忆

```http
POST /api/memory/user/:userId
POST /api/memory/                          # 兼容旧接口（201）
```

`POST /user/:userId` 请求体：

```json
{
  "content": "用户是一名软件工程师",
  "category": "profile",
  "subType": "occupation",
  "confidence": 0.9,
  "groupId": "789",
  "metadata": {}
}
```

`content` 必填（缺失返回 `400` `content is required`），`category` 默认 `custom`。

`POST /`（兼容旧接口）请求体：`{ userId, content, category = 'custom', metadata }`，
`userId` 与 `content` 必填（缺失返回 `400`），`source` 固定 `manual`、
`confidence` 固定 `0.9`。

## 更新记忆

```http
PUT /api/memory/:id
```

`:id` 必须是数字（非数字返回 `400` `id 必须是数字`），调用
`memoryService.updateMemory(parseInt(id), updates)`。

## 删除记忆

```http
DELETE /api/memory/:id
```

`hard` 查询参数支持 `'true'` / `'1'`（字符串查询参数恒为字符串，旧版 `=== 'true'`
恒 false 的问题已修复）。`:id` 必须是数字。

## 清除用户记忆

```http
DELETE /api/memory/user/:userId
POST   /api/memory/user/:userId/cleanup    # 清理低质量记忆（无需 LLM）
```

`hard` 查询参数语义同上。`cleanup` 用于清理该用户的低质量记忆
（低置信度 / 过期 / 过老 / 过短）。

## 总结记忆

```http
POST /api/memory/user/:userId/summarize
```

将用户记忆进行 AI 总结合并，减少冗余条目。总结结果采用 `[分类] 内容` 结构化行
（分类白名单 `profile` / `preference` / `event` / `relation` / `topic` / `custom`），
模型输出的思考过程不会入库。

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

## 群组记忆

```http
GET /api/memory/group/:groupId
GET /api/memory/user/:userId/group/:groupId   # format 参数同上
```

`GET /group/:groupId` 查询参数：`userId`（可选）、`category`（可选）、
`limit`（默认 `100`，钳制 1~1000，非法值回退 100）。

## 批量操作

```http
POST /api/memory/batch
```

请求体为记忆对象数组（`memoryService.saveMemories`），返回逐条保存结果。

## 合并记忆

```http
POST /api/memory/merge/:userId
```

合并该用户记忆（`memoryService.mergeMemories`）。

## 兼容路由的遮蔽语义（重要）

路由注册顺序决定了以下行为，与直觉相反，务必按语义调用：

- `GET /api/memory/:id`（数字主键）注册在前，**遮蔽** `GET /api/memory/:userId`。
  纯数字路径（QQ 号）始终按「主键查单条记忆」处理；只有非纯数字 userId 才走
  用户记忆列表分支。查用户记忆请使用 `GET /api/memory/user/:userId`。
- `DELETE /api/memory/:id`（数字主键，需 `hard` 参数）同理遮蔽
  `DELETE /api/memory/:userId`。清空用户记忆请使用 `DELETE /api/memory/user/:userId`。
- `GET /:id` 非数字时返回 `400`，不会回落到用户分支（校验中间件在两条路由外层生效前
  先匹配第一条动态路由）。

## 轮询整理（背景行为，无 HTTP 端点）

记忆的周期性分析/总结由 `src/services/storage/MemoryManager.js` 完成（`memory.pollInterval`
默认 5 分钟），游标为「内存 Map + `kv_store`（键前缀 `memory:poll:last:`）持久化」双轨
（`_resolvePollCursor` 取两者较大值）；重启后重新处理碰撞窗口内的对话，避免遗漏。
该背景行为与 `memoryRoutes` 的 `MemoryService` 数据层共享同一张 `structured_memories` 表。