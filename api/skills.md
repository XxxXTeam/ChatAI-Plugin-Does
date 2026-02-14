# 技能接口

Skills Agent 提供统一的工具/技能管理接口，整合内置工具、自定义工具和 MCP 服务器工具。

## SSE 实时状态

```http
GET /api/skills/sse
```

实时接收工具状态变更：

```javascript
const es = new EventSource('/api/skills/sse')
es.addEventListener('tool_update', (e) => {
  console.log(JSON.parse(e.data))
})
```

事件类型：
- `tool_update` - 工具列表变更
- `category_toggle` - 类别启用/禁用
- `server_status` - MCP 服务器状态变化

## 获取工具分类

```http
GET /api/skills/categories
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "basic",
      "label": "基础工具",
      "enabled": true,
      "toolCount": 9
    }
  ]
}
```

## 获取工具统计

```http
GET /api/skills/stats
```

**响应**

```json
{
  "success": true,
  "data": {
    "totalTools": 80,
    "enabledTools": 65,
    "categories": 22,
    "mcpServers": 2
  }
}
```

## 重载所有工具

```http
POST /api/skills/reload
```

## 全部启用/禁用

```http
POST /api/skills/enable-all
POST /api/skills/disable-all
```

## 切换类别

```http
POST /api/skills/toggle-category
```

**请求体**

```json
{
  "category": "shell",
  "enabled": false
}
```

## 切换工具

```http
POST /api/skills/toggle-tool
```

**请求体**

```json
{
  "toolName": "execute_command",
  "enabled": false
}
```

## MCP 服务器管理

```http
GET /api/skills/mcp/servers
GET /api/skills/mcp/servers/:name
POST /api/skills/mcp/servers/:name/connect
POST /api/skills/mcp/servers/:name/disconnect
POST /api/skills/mcp/servers/:name/reload
DELETE /api/skills/mcp/servers/:name
```
