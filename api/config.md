# 配置接口

配置路由位于 `src/services/routes/configRoutes.js`，挂载于 `/api/config`（经过 JWT 认证）。
响应封装使用 `ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。

## 获取完整配置

```http
GET /api/config
```

**响应**：`data` 为脱敏后的配置对象，固定包含以下键：

`basic`、`admin`、`llm`、`presets`、`trigger`、`context`、`bym`、`game`、`tools`、
`personality`、`thinking`、`output`、`render`、`features`、`memory`、`mcp`、
`errorNotify`、`web`（仅 `enabled` / `port` / `loginLinks` / `publicUrl` /
`permanentAuthToken` 五个字段）。

```json
{
  "code": 0,
  "data": {
    "basic": {},
    "llm": {},
    "web": { "enabled": true, "port": 3000, "loginLinks": [], "publicUrl": "", "permanentAuthToken": null }
  },
  "message": "ok"
}
```

## 更新配置（深度合并）

```http
POST /api/config
```

请求体为配置对象：顶层键或点分路径（如 `"trigger.prefix"`）都会被写入记忆态并一次性保存。
对象值执行安全深度合并（跳过 `__proto__` / `constructor` / `prototype` 等键，防原型污染），
非安全路径返回 `400`（`非法的配置项: {key}`）。

非对象请求体返回 `400`（`请求体必须是配置对象`）。

**响应**：`data` 为 `{ success: true }`。

## 高级配置

```http
GET /api/config/advanced
PUT /api/config/advanced
```

`GET` 返回 `llm`、`context`、`tools`、`proxy`、`web`、`redis`、`update` 七组配置。
`PUT` 请求体支持同名七个顶层键，各自浅合并写入。

## 触发器配置

```http
GET /api/config/triggers
PUT /api/config/triggers
```

GET 返回 `trigger` 配置；PUT 整体替换（`{ success: true }`）。

## 上下文配置

```http
GET /api/config/context
PUT /api/config/context
```

PUT 为浅合并写入 `context`。

## 人格配置

```http
GET    /api/config/personality
PATCH  /api/config/personality
```

PATCH 为浅合并写入 `personality`。

## 登录链接配置

```http
GET /api/config/links
PUT /api/config/links
```

GET 返回 `{ loginLinks, publicUrl }`；PUT 请求体分别写入 `web.loginLinks` 与
`web.publicUrl`（仅写入非 `undefined` 字段）。

## 主动聊天配置

```http
GET /api/config/proactive-chat
PUT /api/config/proactive-chat
```

## 管理配置

```http
GET /api/config/admin
PUT /api/config/admin
```

## 初始化向导

```http
GET    /api/config/init-status
POST   /api/config/init-complete
POST   /api/config/init-reset
```

## 新手引导（tour）

```http
GET    /api/config/tour-status/:tourId
POST   /api/config/tour-complete/:tourId
POST   /api/config/tour-skip/:tourId
POST   /api/config/tour-reset/:tourId
```

## 快速配置

```http
POST /api/config/quick-setup
```

**请求体**

| 参数 | 类型 | 说明 |
|------|------|------|
| `channel` | object | 渠道配置（`name` / `adapterType` / `baseUrl` / `apiKey` / `models`），写入 `channels` |
| `model` | string | 写入 `llm.defaultModel` |
| `triggerPrefixes` | string[] | 写入 `trigger.prefixes` |

**响应**：`{ success: true }`。

## MCP Server 配置

```http
GET    /api/config/mcp-server
PUT    /api/config/mcp-server
POST   /api/config/mcp-server/generate-key
```

GET 返回 `serverConfig`（`mcp.server`）+ 运行状态摘要：

```json
{
  "code": 0,
  "data": {
    "enabled": false,
    "apiKey": "",
    "mcpEnabled": true,
    "toolCount": 166,
    "activeSessions": 0,
    "endpoint": "/chatai/mcp"
  },
  "message": "ok"
}
```

PUT 请求体为 `{ enabled, apiKey }`；当 `enabled=true` 且无 apiKey 时自动生成
`mcp-` 前缀随机 Key。POST 强制生成新 Key 并启用。

## 渠道独立接口（/api/channels）

渠道管理不在本前缀下，挂在 `/api/channels`（`src/services/routes/channelRoutes.js`，
同样经 JWT 认证）：

```http
GET    /api/channels/list      # 全部渠道（?withStats 附带统计；不带 id 前缀，返回数组）
GET    /api/channels/stats     # 渠道统计（?id 可选过滤）
POST   /api/channels/          # 创建渠道（201，body 为 channelManager.create 的参数）
GET    /api/channels/:id       # 单渠道（404: Channel not found）
PUT    /api/channels/:id       # 更新渠道
DELETE /api/channels/:id       # 删除渠道

POST   /api/channels/test      # 测试单个渠道（带 id 用已存渠道；否则临时 body）
                            # 成功: { message: '连接成功！耗时 <ms>', elapsed, model, keyInfo }
```

`POST /api/channels/test` 请求体（临时测试时可选 `id`）：

```json
{
  "id": "ch_openai_xxx",
  "adapterType": "openai",
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-xxx",
  "models": ["gpt-4o"]
}
```

```http
POST   /api/channels/fetch-models          # { adapterType='openai', baseUrl(必填), apiKey, modelsPath }
PUT    /api/channels/:id/select-baseurl    # { index }（超出 baseUrls 范围返回 400）
POST   /api/channels/:id/test-baseurls     # { forceRetest = false }，测全部 baseUrl 并选最优
POST   /api/channels/batch-test            # { channelId, models?, concurrency? }，批量测试渠道模型
POST   /api/channels/test-model            # { channelId, model }（缺一返回 400）
```

> 注意：`GET /api/channels/list` 返回 `ApiResponse.ok(channels)`（data 为渠道数组）；
> 旧文档中 `/api/config/channels` 系列端点不存在。