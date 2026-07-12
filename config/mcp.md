# MCP 配置

MCP (Model Context Protocol) 是标准化的工具调用协议，本文档说明 MCP 相关配置。

## 基础配置

```yaml
mcp:
  # 启用 MCP
  enabled: true
  
  # 并行执行工具
  parallelExecution: true
  
  # 工具超时（毫秒）
  timeout: 30000
```

## 内置工具配置

```yaml
builtinTools:
  # 启用的类别
  enabledCategories:
    - basic
    - user
    - group
    - message
    - media
    - web
    
  # 禁用的工具
  disabledTools: []
```

### 工具类别（22个）

完整类别列表详见 [内置工具](/tools/builtin)，常用类别如下：

| 类别 | 说明 | 类别 | 说明 |
|------|------|------|------|
| `basic` | 基础工具 | `admin` | 群管理 |
| `user` | 用户信息 | `groupStats` | 群统计 |
| `group` | 群组信息 | `file` | 文件操作 |
| `message` | 消息操作 | `search` | 搜索工具 |
| `media` | 媒体处理 | `utils` | 实用工具 |
| `web` | 网页访问 | `bot` | Bot信息 |
| `memory` | 记忆管理 | `voice` | 语音/声聊 |
| `context` | 上下文管理 | `extra` | 扩展工具 |
| `shell` | 系统命令⚠️ | `schedule` | 定时任务 |
| `bltools` | 扩展工具集 | `reminder` | 定时提醒 |
| `imageGen` | 绘图服务 | `qzone` | QQ空间 |

## 外部 MCP 服务器

配置文件：`data/mcp-servers.json`

```json
{
  "servers": {
    "filesystem": {
      "type": "npm",
      "package": "@anthropic/mcp-server-filesystem",
      "args": ["/home/user/docs"]
    }
  }
}
```

### 服务器类型

#### npm

```json
{
  "type": "npm",
  "package": "@anthropic/mcp-server-filesystem",
  "args": ["/path"]
}
```

#### stdio

```json
{
  "type": "stdio",
  "command": "python",
  "args": ["server.py"],
  "env": {
    "DEBUG": "1"
  }
}
```

#### sse

```json
{
  "type": "sse",
  "url": "https://mcp.example.com/sse",
  "headers": {
    "Authorization": "Bearer xxx"
  }
}
```

#### http

```json
{
  "type": "http",
  "url": "https://api.example.com/mcp"
}
```

## MCP 服务端暴露模式

除了作为 MCP **客户端**接入外部服务器，本插件还可作为 MCP **服务端**，将内置工具以标准 MCP 协议通过 HTTP 暴露给外部 MCP 客户端（如 Claude Desktop、Cline 等），由 `src/services/routes/mcpServerRoutes.js` 实现。

```yaml
mcp:
  server:
    # 是否启用 MCP 服务端暴露
    enabled: true
    # Bearer Token 鉴权密钥（启用时必填，可自动生成）
    apiKey: "mcp-xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mcp.server.enabled` | boolean | `false` | 是否对外暴露内置工具，需显式设为 `true` 才可访问 |
| `mcp.server.apiKey` | string | `""` | Bearer Token 鉴权密钥，用于校验客户端请求 |

::: tip API Key 自动生成
在管理面板中开启 MCP Server，或调用后端接口 `POST /config/mcp-server/generate-key` 时，若未配置 `apiKey`，系统会自动生成形如 `mcp-<48位十六进制>` 的密钥并同时启用服务端。
:::

### 访问端点

服务端路由挂载于插件 Web 服务的 `<mountPath>/mcp`（默认 `mountPath` 为 `/chatai`，即端点为 `/chatai/mcp`），支持两种传输模式：

| 传输模式 | 方法与路径 | 说明 |
|----------|-----------|------|
| Streamable HTTP（推荐）| `POST /`（即 `/chatai/mcp`）| 单端点直接收发 JSON-RPC，`initialize` 响应返回 `Mcp-Session-Id` |
| SSE | `GET /sse` + `POST /message?sessionId=xxx` | `GET /sse` 建立事件流并下发 message endpoint，客户端经 `POST /message` 发送请求 |

此外 `GET /`（即 `/chatai/mcp`）返回服务端状态信息（工具数量、活跃会话数、支持的传输列表等）。所有端点均需通过鉴权中间件。

### 鉴权方式

所有请求必须在 HTTP 头中携带 Bearer Token：

```
Authorization: Bearer mcp-xxxxxxxxxxxxxxxxxxxxxxxx
```

鉴权中间件的校验顺序（源码 `mcpAuthMiddleware`）：

1. 若 `mcp.server.enabled` 不为 `true` → 返回 `403`（`MCP Server 未启用`）。
2. 若未配置 `apiKey` → 返回 `500`（`未配置 API Key`）。
3. 若 Token 缺失或与 `apiKey` 不匹配 → 返回 `401`（`鉴权失败`）。

### 使用场景与安全注意事项

- **使用场景**：将插件的 QQ 操作、群管理、搜索、文件等内置工具复用给外部 Agent/IDE，实现跨客户端的统一工具能力。
- **安全建议**：
  - `apiKey` 等同于访问凭证，请妥善保管，避免提交到公开仓库或日志。
  - 内置工具中包含群管理、文件读写等高权限操作，对外暴露前请评估调用方可信度。
  - 非必要时保持 `mcp.server.enabled: false`，仅在需要对外集成时临时开启。
  - 建议仅在内网或经反向代理加鉴权的环境下暴露该端点。

## 安全配置

```yaml
mcp:
  security:
    # 允许危险工具
    allowDangerous: false
    
    # 危险工具列表
    dangerousTools:
      - execute_command
      - delete_file
      - write_file
    
    # 需要管理员权限的工具
    adminOnlyTools:
      - kick_member
      - ban_member
```

## 权限配置

```yaml
mcp:
  permissions:
    # 默认权限
    default: allow
    
    # 工具权限映射
    tools:
      send_group_message:
        require: member
      recall_message:
        require: admin
```

## 日志配置

```yaml
mcp:
  logging:
    # 记录工具调用
    enabled: true
    
    # 日志级别
    level: info
    
    # 保留天数
    retention: 7
```

## 缓存配置

```yaml
mcp:
  cache:
    # 启用缓存
    enabled: true
    
    # 缓存 TTL（秒）
    ttl: 300
    
    # 可缓存的工具
    tools:
      - get_weather
      - web_search
```

## 完整示例

```yaml
mcp:
  enabled: true
  parallelExecution: true
  timeout: 30000
  
  security:
    allowDangerous: false
    dangerousTools:
      - execute_command
      - delete_file
    adminOnlyTools:
      - kick_member
      
  logging:
    enabled: true
    level: info
    retention: 7
    
  cache:
    enabled: true
    ttl: 300

builtinTools:
  enabledCategories:
    - basic
    - user
    - web
  disabledTools: []
```

## 管理命令

```bash
# 查看工具列表
#工具列表

# 重载工具
#重载工具

# 查看工具日志
#工具日志
```

## 下一步

- [代理配置](./proxy) - 网络代理设置
- [工具开发](/tools/) - 开发自定义工具
