# 游戏接口

游戏路由位于 `src/services/routes/gameRoutes.js`，挂载于两个前缀：

```js
this.router.use('/api/game', createGameRoutes(auth))        // JWT 认证
this.router.use('/api/game-edit', createGameEditRoutes())   // 独立编辑码登录，无 JWT
```

预设存储于 `data/game/presets.json`，会话/角色存于 SQLite（`galgame_sessions` /
`galgame_characters` / `galgame_history` 表）。

## 角色预设

```http
GET    /api/game/presets          # 获取所有预设
GET    /api/game/presets/:id      # 获取单个预设（404: 预设不存在）
POST   /api/game/presets          # 创建预设（201；ID 形如 preset_<ts>_<hex>；isDefault 会取消其他默认）
PUT    /api/game/presets/:id      # 更新预设（404: 预设不存在）
DELETE /api/game/presets/:id      # 删除预设（404: 预设不存在）
```

## 游戏设置

```http
GET /api/game/settings
PUT /api/game/settings
```

GET 返回（读取 `game.*` 与 `llm.models.game`）：

```json
{
  "code": 0,
  "data": {
    "probability": 30,
    "temperature": 0.8,
    "maxTokens": 1000,
    "gameModel": "",
    "enableTools": false
  },
  "message": "ok"
}
```

PUT 请求体同名五字段（`gameModel` 写入 `llm.models.game`），响应 `{ success: true }`。

## 游戏会话

```http
GET    /api/game/sessions          # 最近 100 个会话，含 character_name 与 message_count
DELETE /api/game/sessions/:id      # 删除会话及其历史（id 为数字）
```

## 角色

```http
GET    /api/game/characters        # 全部角色，按 created_at 倒序
DELETE /api/game/characters/:id    # 按 character_id 删除
```

## 游戏统计

```http
GET /api/game/stats
```

**响应（data）**

```json
{
  "totalSessions": 10,
  "activeSessions": 2,
  "totalMessages": 150,
  "totalCharacters": 5
}
```

## 在线编辑（临时编辑会话，30 分钟有效）

`/api/game/edit/*` 用于创建临时编辑会话（内存存储，供游戏端使用），
`/api/game-edit/*` 用初始会话返回的编辑码登录后直接读写并发。

### 创建编辑会话

```http
POST /api/game/edit/create
```

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `userId` | string | 是 | 缺省返回 400 `缺少必要参数` |
| `gameData` | object | 是 | 游戏数据（含 environment / session） |
| `groupId` | string | 否 | 群组 |
| `characterId` | string | 否 | 默认 `default` |

**响应（data）**

```json
{
  "editId": "<uuid>",
  "expiresAt": 1700000000000,
  "editableFields": { "environment": ["name", "world", "...", "summary"], "session": ["relationship"] },
  "protectedFields": ["userId", "groupId", "characterId", "createdAt", "messageCount"]
}
```

### 编辑会话数据

```http
GET  /api/game/edit/:editId            # 404 不存在；410 已过期
PUT  /api/game/edit/:editId            # 提交编辑（过滤受保护字段后暂存）
GET  /api/game/edit/:editId/result     # 游戏端轮询一次结果（取走即删）
```

PUT 请求体为 `{ "updates": { "environment": {...}, "session": {...} } }`，仅接受
`EDITABLE_ENV_FIELDS`（name/world/identity/personality/likes/dislikes/background/
scene/meetingReason/greeting/summary）与 `EDITABLE_SESSION_FIELDS`（relationship）。

响应的 `gameData` 会剥离 `environment.secret`。

## 编辑码登录与直接生效

```http
POST /api/game-edit/login                 # 请求体 { code: "<editId>" }，签名制 token
GET  /api/game-edit/session               # Bearer token 认证；返回编辑数据与可编辑字段
PUT  /api/game-edit/session               # Bearer token 认证；直接写入数据库
```

`PUT /api/game-edit/session` 的 `updates` 会被过滤后先后调用
`galgameService.updateEnvironment` 与 `updateSession`，成功响应
`{ editId, updates, message: '编辑已提交并生效！' }`，会话 30 秒后自动清理。
登录码无效/过期分别返回 `404` / `410`。