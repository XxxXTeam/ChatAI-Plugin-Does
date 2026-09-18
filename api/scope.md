# 作用域接口

作用域路由位于 `src/services/routes/scopeRoutes.js`，挂载于 `/api/scope`（JWT 认证），
基于 `ScopeManager`（`src/services/scope/ScopeManager.js`）提供用户/群组/群用户的
独立配置管理。响应封装为 `ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。

## 用户作用域

```http
GET    /api/scope/users              # 所有用户级配置（listUserSettings）
GET    /api/scope/user/:userId
PUT    /api/scope/user/:userId
DELETE /api/scope/user/:userId
```

## 私聊作用域

```http
GET    /api/scope/privates           # 所有私聊配置
GET    /api/scope/private/:userId
PUT    /api/scope/private/:userId
DELETE /api/scope/private/:userId
```

## 群组作用域

```http
GET    /api/scope/groups             # 所有群配置（附 enabled/triggerMode/groupName 顶层字段）
GET    /api/scope/group/:groupId
PUT    /api/scope/group/:groupId
DELETE /api/scope/group/:groupId
```

`PUT /group/:groupId` 请求体说明：`usageLimit` 嵌套对象会被拉平为
`dailyGroupLimit` / `dailyUserLimit` / `usageLimitMessage` 三个平铺键；
`independentChannels` 数组会被序列化为 JSON 字符串写入；携带
`summaryPushEnabled` 时会触发 `groupSummaryPushService.reload()`。

## 群用户作用域

```http
GET    /api/scope/group-users                        # 所有群的用户配置
GET    /api/scope/group/:groupId/users
GET    /api/scope/group/:groupId/user/:userId
PUT    /api/scope/group/:groupId/user/:userId
DELETE /api/scope/group/:groupId/user/:userId
```

## 群知识库与继承

```http
GET    /api/scope/group/:groupId/knowledge
PUT    /api/scope/group/:groupId/knowledge           # 请求体 { knowledgeIds: [] }
POST   /api/scope/group/:groupId/knowledge/:knowledgeId
DELETE /api/scope/group/:groupId/knowledge/:knowledgeId

PUT    /api/scope/group/:groupId/inheritance         # 请求体 { inheritFrom: [] }
POST   /api/scope/group/:groupId/inheritance         # 请求体 { source }
DELETE /api/scope/group/:groupId/inheritance         # 请求体 { source }
```

GET knowledge 响应 `data`：

```json
{ "knowledgeIds": [], "inheritFrom": [] }
```

## 生效配置查询

```http
GET /api/scope/group/:groupId/effective    # 群生效配置（含继承解析）
GET /api/scope/group/:groupId/resolved     # 群解析后配置
GET /api/scope/group/:groupId/bym-config   # 伪人配置（查询参数 userId 可选）
GET /api/scope/effective/:userId           # 用户生效配置
```

> 注意：本插件没有 `POST /api/scope/batch` 端点。