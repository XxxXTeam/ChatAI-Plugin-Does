---
title: 技能接口
---

# 技能接口

Skills Agent 提供统一的工具/技能管理接口，整合内置工具、自定义工具（`data/skills`）和 MCP 服务器工具。

所有路由挂载于前缀 `/api/skills`。

## 响应格式约定

除 SSE 端点外，所有接口统一返回 `ChaiteResponse` 封装：

```json
{
  "code": 0,
  "data": {},
  "message": "ok"
}
```

- `code`：`0` 表示成功，非 `0` 表示失败（失败时默认 `-1`）。
- `data`：业务数据，失败时通常为 `null`。
- `message`：提示信息，成功为 `ok`，失败为错误描述。

以下各端点的「响应」示例仅展示 `data` 字段内部结构。

## SSE 实时状态

```http
GET /api/skills/sse
```

建立 `text/event-stream` 长连接，实时接收技能与服务器状态变更。连接建立后立即推送 `connected` 事件，之后每 30 秒推送一次 `heartbeat` 心跳。

```javascript
const es = new EventSource('/api/skills/sse')
es.addEventListener('connected', (e) => console.log('已连接', JSON.parse(e.data)))
es.addEventListener('tool-executed', (e) => console.log(JSON.parse(e.data)))
```

事件类型：

| 事件 | 触发时机 | data 字段 |
|------|---------|-----------|
| `connected` | 连接建立 | `{ time }` |
| `heartbeat` | 每 30 秒 | `{ time }` |
| `tool-executed` | 单个技能执行完成 | `{ toolName, success, timestamp }` |
| `batch-executed` | 批量执行完成 | `{ count, timestamp }` |
| `category-toggled` | 类别启用状态切换 | `{ category, enabled, timestamp }` |
| `tool-toggled` | 工具启用状态切换 | `{ tool, enabled, timestamp }` |
| `tools-reloaded` | 全部工具重载 | `{ ...result, timestamp }` |
| `tools-enabled-all` | 全部启用 | `{ ...result, timestamp }` |
| `tools-disabled-all` | 全部禁用 | `{ ...result, timestamp }` |
| `server-connecting` / `server-connected` / `server-error` | 添加 MCP 服务器 | `{ name, ... , timestamp }` |
| `server-removed` | 移除 MCP 服务器 | `{ name, timestamp }` |
| `server-reconnecting` / `server-reconnected` | 重连 MCP 服务器 | `{ name, timestamp }` |
| `skill-loaded` / `skill-unloaded` | 技能加载/卸载 | `{ name, timestamp }` |

## 获取整体状态

```http
GET /api/skills/status
```

返回服务器、统计、类别的聚合状态。

**响应（data）**

```json
{
  "servers": [
    {
      "name": "server-name",
      "status": "connected",
      "type": "stdio",
      "toolsCount": 5,
      "connectedAt": 1720000000000
    }
  ],
  "stats": {},
  "categories": [
    {
      "key": "basic",
      "name": "基础工具",
      "toolCount": 9,
      "enabled": true
    }
  ],
  "timestamp": 1720000000000
}
```

## 获取所有技能

```http
GET /api/skills/tools
```

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `includeBuiltin` | string | `true` | 是否包含内置工具（`'true'` 生效） |
| `includeMcp` | string | `true` | 是否包含 MCP 工具（`'true'` 生效） |
| `presetId` | string | `default` | 预设 ID |

**响应（data）**

```json
{
  "count": 80,
  "tools": []
}
```

## 按来源分类获取技能

```http
GET /api/skills/tools/by-source
```

将技能按 `builtin` / `custom` / `mcp`（按服务器名分组）归类。

**响应（data）**

```json
{
  "builtin": {
    "count": 9,
    "tools": [{ "name": "execute_command", "description": "执行命令" }]
  },
  "custom": {
    "count": 2,
    "tools": [{ "name": "my_tool", "description": "自定义工具" }]
  },
  "mcp": {
    "server-name": {
      "count": 5,
      "tools": [{ "name": "mcp_tool", "description": "MCP 工具" }]
    }
  }
}
```

## 获取文档技能

```http
GET /api/skills/documents
```

返回从 `data/skills` 目录扫描到的 `SKILL.md` 等文档型技能。

**响应（data）**

```json
{
  "count": 3,
  "documents": [
    {
      "name": "my-skill",
      "description": "技能描述",
      "triggers": ["触发词1"],
      "allowedTools": ["tool1"],
      "disallowedTools": [],
      "path": "my-skill/SKILL.md",
      "directory": "my-skill"
    }
  ]
}
```

## 执行技能

```http
POST /api/skills/execute
```

**请求体**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `toolName` | string | 是 | - | 要执行的工具/技能名称 |
| `args` | object | 否 | `{}` | 执行参数 |
| `presetId` | string | 否 | `default` | 预设 ID |

缺少 `toolName` 时返回 `400`。执行完成后广播 `tool-executed` 事件。

**响应（data）**

返回执行结果对象，含 `isError` 字段标识是否出错。

```json
{
  "content": [],
  "isError": false
}
```

## 搜索技能

```http
GET /api/skills/search
```

**查询参数**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `q` | string | `''` | 搜索关键词 |
| `limit` | string | `20` | 返回数量上限 |
| `category` | string | - | 按类别过滤 |
| `source` | string | - | 按来源过滤 |

**响应（data）**

```json
{
  "query": "关键词",
  "count": 5,
  "results": []
}
```

## 获取发现摘要

```http
GET /api/skills/discover
```

返回按类别的统计摘要及技能总数。

**响应（data）**

```json
{
  "total": 80,
  "categories": {}
}
```

## 获取技能详情

```http
GET /api/skills/tools/:name/detail
```

**路径参数**

- `name` - 技能名称

技能不存在时返回 `404`，`message` 为 `技能 {name} 不存在`。

**响应（data）**

返回该技能的详情对象。

## 推荐技能

```http
POST /api/skills/recommend
```

根据上下文文本推荐相关技能。

**请求体**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `context` | string | 是 | - | 上下文文本 |
| `limit` | number | 否 | `5` | 推荐数量上限 |

缺少 `context` 时返回 `400`。

**响应（data）**

```json
{
  "context": "上下文文本",
  "count": 3,
  "recommendations": []
}
```

## 批量执行技能

```http
POST /api/skills/execute/batch
```

**请求体**

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `calls` | array | 是 | `[]` | 执行调用列表，非空数组 |
| `presetId` | string | 否 | `default` | 预设 ID |

`calls` 非数组或为空时返回 `400`。执行完成后广播 `batch-executed` 事件。

**响应（data）**

```json
{
  "count": 2,
  "results": []
}
```

## 获取工具分类

```http
GET /api/skills/categories
```

**响应（data）**

返回类别数组（`getToolCategories()` 原始结构）。

```json
[
  {
    "key": "basic",
    "name": "基础工具",
    "toolCount": 9,
    "enabled": true
  }
]
```

## 切换类别启用状态

```http
POST /api/skills/categories/:key/toggle
```

**路径参数**

- `key` - 类别键

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enabled` | boolean | 是 | 是否启用，非布尔值返回 `400` |

切换后广播 `category-toggled` 事件。

## 切换单个工具启用状态

```http
POST /api/skills/tools/:name/toggle
```

**路径参数**

- `name` - 工具名称

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `enabled` | boolean | 是 | 是否启用，非布尔值返回 `400` |

切换后广播 `tool-toggled` 事件。

## 重载所有工具

```http
POST /api/skills/reload
```

重载完成后广播 `tools-reloaded` 事件。

## 全部启用 / 禁用

```http
POST /api/skills/enable-all
POST /api/skills/disable-all
```

分别广播 `tools-enabled-all` / `tools-disabled-all` 事件。

## 获取工具统计

```http
GET /api/skills/stats
```

**响应（data）**

返回 `getToolStats()` 结构。

```json
{
  "totalTools": 80,
  "enabledTools": 65,
  "categories": 22,
  "mcpServers": 2
}
```

## MCP 服务器管理

### 获取服务器列表

```http
GET /api/skills/mcp/servers
```

**响应（data）**：服务器数组。

### 获取单个服务器详情

```http
GET /api/skills/mcp/servers/:name
```

服务器不存在时返回 `404`，`message` 为 `Server not found`。

### 添加服务器

```http
POST /api/skills/mcp/servers
```

**请求体**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 服务器名称，缺失返回 `400` |
| `config` | object | 否 | 服务器连接配置 |

连接过程中依次广播 `server-connecting`、成功后 `server-connected`、失败后 `server-error`。成功返回 `201`。

### 移除服务器

```http
DELETE /api/skills/mcp/servers/:name
```

移除后广播 `server-removed` 事件。

**响应（data）**

```json
{ "success": true }
```

### 重连服务器

```http
POST /api/skills/mcp/servers/:name/reconnect
```

重连过程中广播 `server-reconnecting`、成功后 `server-reconnected`、失败后 `server-error`。

**响应（data）**

```json
{ "success": true }
```

## 获取上下文配置

```http
GET /api/skills/context-config
```

**响应（data）**

```json
{
  "maxTokens": 0,
  "maxMessages": 20,
  "compressionThreshold": 0.8,
  "compressionStrategy": "summarize",
  "preserveSystemPrompt": true,
  "preserveRecentMessages": 4,
  "autoReloadSkills": true
}
```

## 更新上下文配置

```http
POST /api/skills/context-config
```

仅接受以下白名单字段（其余字段被忽略），以 merge 方式写入 `config` 的 `context` 键。

**请求体**

| 参数 | 类型 | 说明 |
|------|------|------|
| `maxTokens` | number | 最大 token 数，0=不限制 |
| `maxMessages` | number | 最大消息数 |
| `compressionThreshold` | number | 压缩触发阈值 (0-1) |
| `compressionStrategy` | string | 压缩策略：summarize / truncate / sliding-window |
| `preserveSystemPrompt` | boolean | 压缩时保留系统提示 |
| `preserveRecentMessages` | number | 压缩时保留最近消息数 |
| `autoReloadSkills` | boolean | 压缩后自动重载 skills |

**响应**

`data` 为本次实际生效的字段，`message` 为 `上下文配置已更新`。

## 获取已加载技能

```http
GET /api/skills/loaded
```

Skills 未初始化时返回空列表。

**响应（data）**

```json
{
  "skills": [],
  "loaded": ["skill-name-1", "skill-name-2"]
}
```

## 加载技能

```http
POST /api/skills/load/:name
```

**路径参数**

- `name` - 技能名称

Skills 未初始化返回 `500`；技能不存在返回 `404`（`message` 为 `技能 {name} 不存在`）。加载成功广播 `skill-loaded` 事件。

**响应（data）**

```json
{
  "name": "skill-name",
  "loaded": true
}
```

## 卸载技能

```http
POST /api/skills/unload/:name
```

**路径参数**

- `name` - 技能名称

Skills 未初始化返回 `500`。卸载后广播 `skill-unloaded` 事件。

**响应（data）**

```json
{
  "name": "skill-name",
  "loaded": false
}
```

## 技能文件格式

Skills 系统支持从 `data/skills` 目录扫描多种格式的技能文件：

| 文件类型 | 说明 |
|---------|------|
| `SKILL.md` | Markdown 格式，frontmatter + 正文指令 |
| `*.skill.yaml` / `*.skill.yml` | YAML 格式技能定义 |
| `*.skill.json` | JSON 格式技能定义 |
| `skill.yaml` / `skill.json` | 文件夹内的技能定义 |

### SKILL.md 格式

```markdown
---
name: my-skill
description: 技能描述
triggers: [触发词1, 触发词2]
allowedTools: [tool1, tool2]
disallowedTools: []
priority: 10
autoActivate: true
---

技能指令正文内容...
```

### YAML 格式

```yaml
name: my-skill
description: 技能描述
triggers:
  - 触发词1
  - 触发词2
allowedTools:
  - tool1
  - tool2
disallowedTools: []
instructions: |
  技能指令正文内容...
capabilities:
  - tool_use
priority: 10
autoActivate: true
```

## 内置工具: list_skills

列出所有可用的技能及其描述。模型可调用此工具了解有哪些技能可以加载。

```json
{
  "name": "list_skills",
  "inputSchema": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

## 内置工具: load_skill

加载指定的技能到当前会话。加载后技能的指令将在后续对话中生效。

```json
{
  "name": "load_skill",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "要加载的技能名称" }
    },
    "required": ["name"]
  }
}
```

## 内置工具: get_skill_info

获取指定技能的详细信息。

```json
{
  "name": "get_skill_info",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "技能名称" }
    },
    "required": ["name"]
  }
}
```
