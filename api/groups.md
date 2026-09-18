# 群组管理 API

群组管理路由位于 `src/services/routes/groupAdminRoutes.js`，挂载于 `/api/group-admin`
（**不经插件全局 JWT**，使用独立的群管理会话体系）。

## 认证体系

- 一次性登录码：`generateGroupAdminLoginCode` 生成 6 位字母数字码（5 分钟有效，用后即焚）。
- 登录码兑换：`POST /login` 返回会话 JWT（签发参数 `type: 'group_admin_session'`，
  密钥为 `web.groupAdminSecret`，HS256，24 小时）。
- 后续请求以 `Authorization: Bearer <token>` 携带，由 `groupAdminAuth` 中间件校验，
  并把 `{ groupId, userId }` 写入 `req.groupAdmin`。

| 项目 | 值 |
|:-----|:---|
| **Base Path** | `/api/group-admin` |
| **认证** | 群管理会话 Token（Bearer） |
| **限流** | 登录接口每 IP 60 秒最多 5 次，超出返回 `429` |

## 登录与校验

### 群管理员登录

```http
POST /api/group-admin/login
```

**请求体**

```json
{ "code": "A1B2C3" }
```

`code` 缺失返回 `400`（`请输入登录码`）；无效/过期/已使用返回 `401`。

**响应（data）**

```json
{ "token": "<jwt>", "groupId": "123456789", "userId": "111222333", "expiresIn": 86400 }
```

### 验证 Token

```http
GET /api/group-admin/verify
```

**响应（data）**

```json
{ "valid": true, "groupId": "123456789", "userId": "111222333" }
```

## 群配置

### 获取群配置

```http
GET /api/group-admin/config
```

返回该群的完整配置聚合（作用域设置 + 预设列表 + 渠道列表 + 知识库列表 + 表情统计），
字段以代码为准，包括：`groupId`、`groupName`、`systemPrompt`、`presetId`、`enabled`、
`triggerMode`、`customPrefix`、`toolsEnabled`、`imageGenEnabled`、`summaryEnabled`、
`eventHandler`、`emojiThief`、`bym`（含 `proactive` 与 `style` 子对象）、`chat`、
`imageGen`、`game`、`models`（chat/tools/dispatch/vision/image/search/bym/summary/profile/game）、
`listMode`、`blacklist`、`whitelist`、`knowledgeIds`、`independentChannel`
（apiKey 以 `****` + 末 4 位掩码，`forbidGlobal` 字段不返回到群管理面板）、
`usageLimit`、`summary`（含 `push`）、`tools`、`events`（welcome/goodbye/poke/recall/ban/
luckyKing/honor/essence/admin）、`emojiStats`、`presets`、`channels`、`knowledgeBases`。

### 更新群配置

```http
PUT /api/group-admin/config
```

请求体与 GET 返回结构同构（按 `emojiThief` / `bym` / `chat` / `imageGen` / `game` /
`models` / `tools` / `events` / `usageLimit` / `summary` 分段映射到平铺设置键，并同时
写入多套别名键保证两个编辑器兼容）。掩码 apiKey（`****` 开头）从已存配置恢复，不重复写入。

保存失败返回 `500`（`群配置保存失败，请稍后重试`）；更新 `summaryPushEnabled` 会重载
总结推送调度。

## 黑白名单

```http
GET    /api/group-admin/blacklist
PUT    /api/group-admin/blacklist          # 请求体 { blacklist: [] }，非数组返回 400
POST   /api/group-admin/blacklist/add      # 请求体 { userId }
POST   /api/group-admin/blacklist/remove   # 请求体 { userId }

GET    /api/group-admin/whitelist
PUT    /api/group-admin/whitelist          # 请求体 { whitelist: [] }，非数组返回 400
```

## 定时任务（已重构，占位）

```http
GET  /api/group-admin/scheduler/status
POST /api/group-admin/scheduler/trigger
```

两者均为占位实现：返回 `{ enabled: false, message: '定时任务模块已重构' }` /
`{ success: false, message: '定时总结功能已重构，请使用新的自然语言定时任务' }`。

## 模型获取

```http
POST /api/group-admin/models/fetch
```

**请求体**：`{ adapterType, baseUrl, apiKey, modelsPath }`（`baseUrl`+`apiKey` 必填，
缺失返回 `400`）。支持 `****` 掩码 Key 自动恢复；返回与
`/api/channels/fetch-models` 一致的归一化模型列表。

## 群独立渠道

```http
GET    /api/group-admin/channel
PUT    /api/group-admin/channel
DELETE /api/group-admin/channel
```

GET 返回 `{ groupId, hasIndependentChannel, channelId, baseUrl, apiKey(掩码), adapterType, modelId }`
（`forbidGlobal` 不返回）。PUT 请求体为 `{ baseUrl, apiKey, adapterType, modelId }`，
`forbidGlobal` 保持现有值不允许修改。DELETE 清空渠道配置（`forbidGlobal` 保留）。

## 使用限制与统计

```http
GET  /api/group-admin/usage-limit
PUT  /api/group-admin/usage-limit       # { dailyGroupLimit, dailyUserLimit, limitMessage }

GET  /api/group-admin/usage-stats
POST /api/group-admin/usage-stats/reset
```

GET usage-stats 返回 `{ groupId, date, groupCount, dailyGroupLimit, dailyUserLimit,
groupRemaining, topUsers, totalUsers }`。

## 表情管理

```http
GET    /api/group-admin/emoji/view      # 查询参数 file（缺失 400），直接返回图片流
DELETE /api/group-admin/emoji/delete    # 查询参数 file（缺失 400），删除单个表情
DELETE /api/group-admin/emoji/clear     # 清空群表情目录
```

## 错误响应

响应统一为 `ChaiteResponse`（`{ code, data, message }`）。典型错误：

- `401` `需要群管理员认证` / `会话无效或已过期，请重新登录`
- `400` 参数校验失败（`请输入登录码` / `blacklist必须是数组` 等）
- `429` `登录尝试过于频繁，请稍后再试`