# MCP 接口

MCP 路由位于 `src/services/routes/mcpRoutes.js`，挂载于 `/api/mcp`（JWT 认证）。
基于 `mcpManager`（`src/mcp/McpManager.js`）管理外部 MCP 服务器，响应封装为
`ChaiteResponse`（`{ code: 0, data, message: 'ok' }`）。

服务器类型由 `normalizeServerConfig` 归一，支持 `stdio` / `npm` / `npx` /
`sse` / `http` / `streamable-http`。内置服务器（`isBuiltin`）不可更新/删除。

## 获取 MCP 服务器列表

```http
GET /api/mcp/servers
```

**响应**：`data` 为 `mcpManager.getServers()` 返回的服务器数组。

## 获取服务器详情

```http
GET /api/mcp/servers/:name
```

不存在时返回 `404`（`Server not found`）。

## 添加 MCP 服务器

```http
POST /api/mcp/servers
```

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 缺失返回 `400`（`name is required`） |
| `config` | object | 否 | 服务器配置，不同类型有不同必填字段 |

**config 按类型校验**

| 类型 | 必填字段 | 样例 |
|------|---------|------|
| `stdio` | `command` | `{ "type": "stdio", "command": "python", "args": ["server.py"] }` |
| `npm` / `npx` | `package` | `{ "type": "npm", "package": "..." }` |
| `sse` / `http` / `streamable-http` | `url` | `{ "type": "sse", "url": "https://..." }` |

其他类型返回 `400`（`Unsupported server type: {type}`）。成功返回 `201`。

## 更新 MCP 服务器

```http
PUT /api/mcp/servers/:name
```

请求体为 `{ "config": { ... } }`（缺失返回 `400`）。内置服务器更新返回 `400`
（`Cannot update builtin server`）。

## 删除 MCP 服务器

```http
DELETE /api/mcp/servers/:name
```

内置服务器删除返回 `400`（`Cannot delete builtin server`）。

## 重连服务器

```http
POST /api/mcp/servers/:name/reconnect
```

响应 `{ success: true }`。

## 获取服务器工具

```http
GET /api/mcp/servers/:name/tools
```

**响应**：`data` 为 `server.tools` 数组。

## 导入 MCP 配置

```http
POST /api/mcp/import
```

**请求体**：`{ "mcpServers": { "<name>": <serverConfig>, ... } }`（兼容 Claude
Desktop 配置格式），非对象返回 `400`。

**响应（data）**

```json
{ "success": 2, "failed": 1, "total": 3, "errors": [ { "name": "x", "error": "..." } ] }
```

## MCP 资源

```http
GET  /api/mcp/resources             # 全部资源
GET  /api/mcp/resources/templates   # 资源模板
POST /api/mcp/resources/read        # 读取资源
```

`POST /resources/read` 请求体：

```json
{ "serverName": "filesystem", "uri": "file:///path" }
```

`serverName` 与 `uri` 必填（缺失返回 `400`）。

## MCP 提示（prompts）

```http
GET  /api/mcp/prompts
POST /api/mcp/prompts/get
```

`POST /prompts/get` 请求体：

```json
{ "serverName": "github", "name": "create_issue", "args": {} }
```

`serverName` 与 `name` 必填（缺失返回 `400`）。

## MCP Server 接入端点（插件对外提供 MCP 服务）

插件自身暴露的 MCP 端点位于 `src/services/routes/mcpServerRoutes.js`，挂载于
`/mcp`（注意：不在 `/api` 前缀下，管理面板由 `/api/config/mcp-server` 控制）：

```http
GET    /mcp/sse        # legacy-sse：建立会话流，写出 event: endpoint 告知消息路径
POST   /mcp/message    # legacy-sse：发送 JSON-RPC 消息（query 带 sessionId）
POST   /mcp/           # streamable-http：JSON-RPC 单发（initialize / 通知等）
GET    /mcp/           # streamable-http：SSE 流（要 Mcp-Session-Id 头）
DELETE /mcp/           # streamable-http：终止会话（204）
GET    /mcp/status     # 运行状态（name/version/protocolVersion/toolCount/activeSessions 等）
```

端点由 `mcpAuthMiddleware` 保护。API Key 配置见[配置接口](./config#mcp-server-配置)。