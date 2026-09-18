---
title: Skills API
---

# Skills API

The Skills Agent provides a unified tool/skill management interface, integrating built-in tools, custom tools (`data/skills`), and MCP server tools.

All routes are mounted under the `/api/skills` prefix.

## Response Format Convention

Except for SSE endpoints, all endpoints return the unified `ChaiteResponse` envelope:

```json
{
  "code": 0,
  "data": {},
  "message": "ok"
}
```

- `code`: `0` means success, non-zero means failure (defaults to `-1` on failure).
- `data`: business payload; usually `null` on failure.
- `message`: hint text; `ok` on success, error description on failure.

The "Response" examples below only show the inner structure of the `data` field.

## SSE Real-time Status

```http
GET /api/skills/sse
```

Establishes a `text/event-stream` long-lived connection that pushes skill and server status changes in real time. A `connected` event is pushed immediately after the connection is established, followed by a `heartbeat` every 30 seconds.

```javascript
const es = new EventSource('/api/skills/sse')
es.addEventListener('connected', (e) => console.log('Connected', JSON.parse(e.data)))
es.addEventListener('tool-executed', (e) => console.log(JSON.parse(e.data)))
```

Event types:

| Event | Trigger | data fields |
|-------|---------|-------------|
| `connected` | Connection established | `{ time }` |
| `heartbeat` | Every 30 seconds | `{ time }` |
| `tool-executed` | A single skill execution completed | `{ toolName, success, timestamp }` |
| `batch-executed` | Batch execution completed | `{ count, timestamp }` |
| `category-toggled` | A category's enabled state toggled | `{ category, enabled, timestamp }` |
| `tool-toggled` | A tool's enabled state toggled | `{ tool, enabled, timestamp }` |
| `tools-reloaded` | All tools reloaded | `{ ...result, timestamp }` |
| `tools-enabled-all` | All tools enabled | `{ ...result, timestamp }` |
| `tools-disabled-all` | All tools disabled | `{ ...result, timestamp }` |
| `server-connecting` / `server-connected` / `server-error` | Adding an MCP server | `{ name, ... , timestamp }` |
| `server-removed` | Removing an MCP server | `{ name, timestamp }` |
| `server-reconnecting` / `server-reconnected` | Reconnecting an MCP server | `{ name, timestamp }` |
| `skill-loaded` / `skill-unloaded` | Skill loaded/unloaded | `{ name, timestamp }` |

## Get Overall Status

```http
GET /api/skills/status
```

Returns aggregated server, statistics, and category status.

**Response (data)**

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
      "name": "Basic",
      "toolCount": 9,
      "enabled": true
    }
  ],
  "timestamp": 1720000000000
}
```

## Get All Skills

```http
GET /api/skills/tools
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeBuiltin` | string | `true` | Whether to include built-in tools (`'true'` takes effect) |
| `includeMcp` | string | `true` | Whether to include MCP tools (`'true'` takes effect) |
| `presetId` | string | `default` | Preset ID |

**Response (data)**

```json
{
  "count": 80,
  "tools": []
}
```

## Get Skills Grouped by Source

```http
GET /api/skills/tools/by-source
```

Groups skills by `builtin` / `custom` / `mcp` (MCP tools grouped by server name).

**Response (data)**

```json
{
  "builtin": {
    "count": 9,
    "tools": [{ "name": "execute_command", "description": "Execute command" }]
  },
  "custom": {
    "count": 2,
    "tools": [{ "name": "my_tool", "description": "Custom tool" }]
  },
  "mcp": {
    "server-name": {
      "count": 5,
      "tools": [{ "name": "mcp_tool", "description": "MCP tool" }]
    }
  }
}
```

## Get Document Skills

```http
GET /api/skills/documents
```

Returns document-style skills such as `SKILL.md` scanned from the `data/skills` directory.

**Response (data)**

```json
{
  "count": 3,
  "documents": [
    {
      "name": "my-skill",
      "description": "Skill description",
      "triggers": ["trigger 1"],
      "allowedTools": ["tool1"],
      "disallowedTools": [],
      "path": "my-skill/SKILL.md",
      "directory": "my-skill"
    }
  ]
}
```

## Execute a Skill

```http
POST /api/skills/execute
```

**Request Body**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `toolName` | string | Yes | - | Name of the tool/skill to execute |
| `args` | object | No | `{}` | Execution arguments |
| `presetId` | string | No | `default` | Preset ID |

Returns `400` when `toolName` is missing. Broadcasts a `tool-executed` event after execution completes.

**Response (data)**

Returns the execution result object with an `isError` field indicating whether an error occurred.

```json
{
  "content": [],
  "isError": false
}
```

## Search Skills

```http
GET /api/skills/search
```

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | `''` | Search keyword |
| `limit` | string | `20` | Maximum number of results |
| `category` | string | - | Filter by category |
| `source` | string | - | Filter by source |

**Response (data)**

```json
{
  "query": "keyword",
  "count": 5,
  "results": []
}
```

## Get Discovery Summary

```http
GET /api/skills/discover
```

Returns a per-category statistics summary and the total number of skills.

**Response (data)**

```json
{
  "total": 80,
  "categories": {}
}
```

## Get Skill Details

```http
GET /api/skills/tools/:name/detail
```

**Path Parameters**

- `name` - Skill name

Returns `404` when the skill does not exist, with `message` set to `Skill {name} does not exist`.

**Response (data)**

Returns the skill's detail object.

## Recommend Skills

```http
POST /api/skills/recommend
```

Recommends relevant skills based on context text.

**Request Body**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `context` | string | Yes | - | Context text |
| `limit` | number | No | `5` | Maximum number of recommendations |

Returns `400` when `context` is missing.

**Response (data)**

```json
{
  "context": "context text",
  "count": 3,
  "recommendations": []
}
```

## Execute Skills in Batch

```http
POST /api/skills/execute/batch
```

**Request Body**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `calls` | array | Yes | `[]` | List of execution calls; must be a non-empty array |
| `presetId` | string | No | `default` | Preset ID |

Returns `400` when `calls` is not an array or is empty. Broadcasts a `batch-executed` event after execution completes.

**Response (data)**

```json
{
  "count": 2,
  "results": []
}
```

## Get Tool Categories

```http
GET /api/skills/categories
```

**Response (data)**

Returns the category array (raw structure from `getToolCategories()`).

```json
[
  {
    "key": "basic",
    "name": "Basic",
    "toolCount": 9,
    "enabled": true
  }
]
```

## Toggle a Category's Enabled State

```http
POST /api/skills/categories/:key/toggle
```

**Path Parameters**

- `key` - Category key

**Request Body**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether to enable; non-boolean values return `400` |

Broadcasts a `category-toggled` event after toggling.

## Toggle a Single Tool's Enabled State

```http
POST /api/skills/tools/:name/toggle
```

**Path Parameters**

- `name` - Tool name

**Request Body**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enabled` | boolean | Yes | Whether to enable; non-boolean values return `400` |

Broadcasts a `tool-toggled` event after toggling.

## Reload All Tools

```http
POST /api/skills/reload
```

Broadcasts a `tools-reloaded` event after the reload completes.

## Enable All / Disable All

```http
POST /api/skills/enable-all
POST /api/skills/disable-all
```

Broadcasts `tools-enabled-all` / `tools-disabled-all` respectively.

## Get Tool Statistics

```http
GET /api/skills/stats
```

**Response (data)**

Returns the `getToolStats()` structure.

```json
{
  "totalTools": 80,
  "enabledTools": 65,
  "categories": 22,
  "mcpServers": 2
}
```

## MCP Server Management

### Get Server List

```http
GET /api/skills/mcp/servers
```

**Response (data)**: array of servers.

### Get a Single Server's Details

```http
GET /api/skills/mcp/servers/:name
```

Returns `404` when the server does not exist, with `message` set to `Server not found`.

### Add a Server

```http
POST /api/skills/mcp/servers
```

**Request Body**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Server name; returns `400` when missing |
| `config` | object | No | Server connection configuration |

Broadcasts `server-connecting` during connection, then `server-connected` on success or `server-error` on failure. Returns `201` on success.

### Remove a Server

```http
DELETE /api/skills/mcp/servers/:name
```

Broadcasts a `server-removed` event after removal.

**Response (data)**

```json
{ "success": true }
```

### Reconnect a Server

```http
POST /api/skills/mcp/servers/:name/reconnect
```

Broadcasts `server-reconnecting` during reconnection, then `server-reconnected` on success or `server-error` on failure.

**Response (data)**

```json
{ "success": true }
```

## Get Context Config

```http
GET /api/skills/context-config
```

**Response (data)**

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

## Update Context Config

```http
POST /api/skills/context-config
```

Only the following whitelisted fields are accepted (all other fields are ignored); they are merged into the `context` key of `config`.

**Request Body**

| Parameter | Type | Description |
|-----------|------|-------------|
| `maxTokens` | number | Max tokens; 0 = unlimited |
| `maxMessages` | number | Max messages |
| `compressionThreshold` | number | Compression trigger threshold (0-1) |
| `compressionStrategy` | string | Compression strategy: summarize / truncate / sliding-window |
| `preserveSystemPrompt` | boolean | Preserve the system prompt when compressing |
| `preserveRecentMessages` | number | Number of recent messages to preserve when compressing |
| `autoReloadSkills` | boolean | Auto-reload skills after compression |

**Response**

`data` contains the fields that actually took effect; `message` is `Context config updated`.

## Get Loaded Skills

```http
GET /api/skills/loaded
```

Returns an empty list when Skills is not initialized.

**Response (data)**

```json
{
  "skills": [],
  "loaded": ["skill-name-1", "skill-name-2"]
}
```

## Load a Skill

```http
POST /api/skills/load/:name
```

**Path Parameters**

- `name` - Skill name

Returns `500` when Skills is not initialized; returns `404` (`message` is `Skill {name} does not exist`) when the skill does not exist. Broadcasts a `skill-loaded` event on success.

**Response (data)**

```json
{
  "name": "skill-name",
  "loaded": true
}
```

## Unload a Skill

```http
POST /api/skills/unload/:name
```

**Path Parameters**

- `name` - Skill name

Returns `500` when Skills is not initialized. Broadcasts a `skill-unloaded` event after unloading.

**Response (data)**

```json
{
  "name": "skill-name",
  "loaded": false
}
```

## Skill File Formats

The Skills system scans the `data/skills` directory for multiple skill file formats:

| File type | Description |
|-----------|-------------|
| `SKILL.md` | Markdown format: frontmatter + instruction body |
| `*.skill.yaml` / `*.skill.yml` | YAML skill definitions |
| `*.skill.json` | JSON skill definitions |
| `skill.yaml` / `skill.json` | Skill definition inside a folder |

### SKILL.md Format

```markdown
---
name: my-skill
description: Skill description
triggers: [trigger 1, trigger 2]
allowedTools: [tool1, tool2]
disallowedTools: []
priority: 10
autoActivate: true
---

Skill instruction body...
```

### YAML Format

```yaml
name: my-skill
description: Skill description
triggers:
  - trigger 1
  - trigger 2
allowedTools:
  - tool1
  - tool2
disallowedTools: []
instructions: |
  Skill instruction body...
capabilities:
  - tool_use
priority: 10
autoActivate: true
```

## Built-in Tool: list_skills

Lists all available skills and their descriptions. The model can call this tool to learn which skills are available to load.

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

## Built-in Tool: load_skill

Loads the specified skill into the current session. The skill's instructions take effect in subsequent conversations.

```json
{
  "name": "load_skill",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Name of the skill to load" }
    },
    "required": ["name"]
  }
}
```

## Built-in Tool: get_skill_info

Gets detailed information about a specific skill.

```json
{
  "name": "get_skill_info",
  "inputSchema": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "description": "Skill name" }
    },
    "required": ["name"]
  }
}
```