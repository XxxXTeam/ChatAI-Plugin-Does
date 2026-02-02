# MCP 接口

## 获取 MCP 服务器列表

```http
GET /api/mcp/servers
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "filesystem",
      "type": "npm",
      "package": "@anthropic/mcp-server-filesystem",
      "status": "connected",
      "toolCount": 5
    },
    {
      "name": "memory",
      "type": "npm",
      "package": "@modelcontextprotocol/server-memory",
      "status": "disconnected"
    }
  ]
}
```

## 获取服务器详情

```http
GET /api/mcp/servers/:name
```

**响应**

```json
{
  "success": true,
  "data": {
    "name": "filesystem",
    "type": "npm",
    "package": "@anthropic/mcp-server-filesystem",
    "args": ["/home/user/docs"],
    "status": "connected",
    "tools": [
      {
        "name": "read_file",
        "description": "Read file contents"
      }
    ],
    "resources": [],
    "prompts": []
  }
}
```

## 添加 MCP 服务器

```http
POST /api/mcp/servers
```

**请求体 (npm)**

```json
{
  "name": "github",
  "type": "npm",
  "package": "@anthropic/mcp-server-github",
  "env": {
    "GITHUB_TOKEN": "ghp_xxx"
  }
}
```

**请求体 (stdio)**

```json
{
  "name": "custom",
  "type": "stdio",
  "command": "python",
  "args": ["server.py"]
}
```

**请求体 (sse)**

```json
{
  "name": "remote",
  "type": "sse",
  "url": "https://mcp.example.com/sse",
  "headers": {
    "Authorization": "Bearer xxx"
  }
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "name": "github",
    "status": "connecting"
  }
}
```

## 更新 MCP 服务器

```http
PUT /api/mcp/servers/:name
```

**请求体**

```json
{
  "args": ["/new/path"],
  "enabled": true
}
```

## 删除 MCP 服务器

```http
DELETE /api/mcp/servers/:name
```

## 连接服务器

```http
POST /api/mcp/servers/:name/connect
```

**响应**

```json
{
  "success": true,
  "data": {
    "status": "connected",
    "toolCount": 5
  }
}
```

## 断开服务器

```http
POST /api/mcp/servers/:name/disconnect
```

## 重连所有服务器

```http
POST /api/mcp/servers/reconnect-all
```

## 获取服务器工具

```http
GET /api/mcp/servers/:name/tools
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "name": "read_file",
      "description": "Read file contents",
      "parameters": {...}
    }
  ]
}
```

## 获取服务器资源

```http
GET /api/mcp/servers/:name/resources
```

**响应**

```json
{
  "success": true,
  "data": [
    {
      "uri": "file:///path/to/file",
      "name": "文件名",
      "mimeType": "text/plain"
    }
  ]
}
```

## 读取资源

```http
GET /api/mcp/resources
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| uri | string | 资源 URI |
| server | string | 服务器名称 |

**响应**

```json
{
  "success": true,
  "data": {
    "content": "文件内容...",
    "mimeType": "text/plain"
  }
}
```

## 获取提示词列表

```http
GET /api/mcp/prompts
```

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| server | string | 服务器名称 |

## SSE 状态流

```http
GET /api/mcp/sse
```

实时接收 MCP 服务器状态更新：

```javascript
const es = new EventSource('/api/mcp/sse')

es.onmessage = (event) => {
  const { type, server, status } = JSON.parse(event.data)
  console.log(`${server}: ${status}`)
}
```

事件类型：
- `connected` - 服务器已连接
- `disconnected` - 服务器已断开
- `error` - 连接错误
- `tools_updated` - 工具列表更新
